/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
import Reflux from 'reflux';
import URI from 'urijs';

import * as URLUtils from 'util/URLUtils';
import UserNotification from 'util/UserNotification';
import fetch, { fetchPeriodically } from 'logic/rest/FetchProvider';
import { singletonStore, singletonActions } from 'logic/singleton';
import type { SidecarSummary, SidecarCollectorPairType, Configuration } from 'components/sidecars/types';

export type PaginationOptions = {
  query: string;
  sortField?: string;
  order?: string;
  pageSize: number;
  page: number;
  onlyActive: string | boolean;
};
type Actions = {
  listPaginated: (options: Partial<PaginationOptions>) => Promise<unknown>;
  getSidecar: (id: string) => Promise<unknown>;
  getSidecarActions: () => Promise<unknown>;
  restartCollector: () => Promise<unknown>;
  assignConfigurations: (
    selectedSidecars: SidecarCollectorPairType[],
    selectedConfigurations: Configuration[],
  ) => Promise<unknown>;
};
export const SidecarsActions = singletonActions('core.Sidecars', () =>
  Reflux.createActions<Actions>({
    listPaginated: { asyncResult: true },
    getSidecar: { asyncResult: true },
    getSidecarActions: { asyncResult: true },
    restartCollector: { asyncResult: true },
    assignConfigurations: { asyncResult: true },
  }),
);

type StoreState = {
  sidecars: SidecarSummary[];
  onlyActive: string;
  pagination: {
    count: number;
    page: number;
    pageSize: number;
    total: undefined;
  };
  query: string | undefined;
  sort: {
    field: string;
    order: string;
  };
};
type Response = {
  sidecars: SidecarSummary[];
  query: string;
  only_active: boolean;
  pagination: {
    total: number;
    count: number;
    page: number;
    per_page: number;
  };
  sort: string;
  order: string;
};
export const SidecarsStore = singletonStore('core.Sidecars', () =>
  Reflux.createStore<StoreState>({
    listenables: [SidecarsActions],
    sourceUrl: '/sidecars',
    sidecars: undefined,
    onlyActive: undefined,
    pagination: {
      count: undefined,
      page: undefined,
      pageSize: undefined,
      total: undefined,
    },
    query: undefined,
    sort: {
      field: undefined,
      order: undefined,
    },

    getInitialState() {
      return {
        sidecars: this.sidecars,
        query: this.query,
        onlyActive: this.onlyActive,
        pagination: this.pagination,
        sort: this.sort,
      };
    },

    propagateChanges() {
      this.trigger(this.getInitialState());
    },

    listPaginated({ query = '', page = 1, pageSize = 50, onlyActive = false, sortField = 'node_name', order = 'asc' }) {
      const search = {
        query: query,
        page: page,
        per_page: pageSize,
        only_active: onlyActive,
        sort: sortField,
        order: order,
      };

      const uri = URI(this.sourceUrl).search(search).toString();
      const promise = fetchPeriodically('GET', URLUtils.qualifyUrl(uri));

      promise.then(
        (response: Response) => {
          this.sidecars = response.sidecars;
          this.query = response.query;
          this.onlyActive = response.only_active;

          this.pagination = {
            total: response.pagination.total,
            count: response.pagination.count,
            page: response.pagination.page,
            pageSize: response.pagination.per_page,
          };

          this.sort = {
            field: response.sort,
            order: response.order,
          };

          this.propagateChanges();

          return response;
        },
        (error) => {
          UserNotification.error(
            error.status === 400 ? error.responseMessage : `Fetching Sidecars failed with status: ${error.message}`,
            'Could not retrieve Sidecars',
          );
        },
      );

      SidecarsActions.listPaginated.promise(promise);
    },

    getSidecar(sidecarId) {
      const promise = fetchPeriodically('GET', URLUtils.qualifyUrl(`${this.sourceUrl}/${sidecarId}`));

      promise.catch((error) => {
        let errorMessage = `Fetching Sidecar failed with status: ${error}`;

        if (error.status === 404) {
          errorMessage = `Unable to find a sidecar with ID <${sidecarId}>, maybe it was inactive for too long.`;
        }

        UserNotification.error(errorMessage, 'Could not retrieve Sidecar');
      });

      SidecarsActions.getSidecar.promise(promise);
    },

    restartCollector(sidecarId, collector) {
      const action = {
        collector,
        properties: { restart: true },
      };
      const promise = fetch('PUT', URLUtils.qualifyUrl(`${this.sourceUrl}/${sidecarId}/action`), [action]);

      promise.catch((error) => {
        UserNotification.error(`Restarting Sidecar failed with status: ${error}`, 'Could not restart Sidecar');
      });

      SidecarsActions.restartCollector.promise(promise);
    },

    getSidecarActions(sidecarId) {
      const promise = fetchPeriodically('GET', URLUtils.qualifyUrl(`${this.sourceUrl}/${sidecarId}/action`));

      promise.catch((error) => {
        UserNotification.error(
          `Fetching Sidecar actions failed with status: ${error}`,
          'Could not retrieve Sidecar actions',
        );
      });

      SidecarsActions.getSidecarActions.promise(promise);
    },

    toConfigurationAssignmentDto(nodeId, collectorId, configurationId) {
      return {
        node_id: nodeId,
        collector_id: collectorId,
        configuration_id: configurationId,
      };
    },

    assignConfigurations(sidecars, configurations) {
      const nodes = sidecars.map(({ sidecar, collector }) => {
        // Add all previous assignments, but the one that was changed
        const assignments = sidecar.assignments.filter((assignment) => assignment.collector_id !== collector.id);

        // Add new assignments
        configurations.forEach((configuration) => {
          assignments.push({ collector_id: collector.id, configuration_id: configuration.id });
        });

        return { node_id: sidecar.node_id, assignments: assignments };
      });

      const promise = fetch('PUT', URLUtils.qualifyUrl(`${this.sourceUrl}/configurations`), { nodes: nodes });

      promise.then(
        (response) => {
          UserNotification.success('', `Configuration change for ${sidecars.length} collectors requested`);

          return response;
        },
        (error) => {
          UserNotification.error(
            `Fetching Sidecar actions failed with status: ${error}`,
            'Could not retrieve Sidecar actions',
          );
        },
      );

      SidecarsActions.assignConfigurations.promise(promise);
    },
  }),
);
