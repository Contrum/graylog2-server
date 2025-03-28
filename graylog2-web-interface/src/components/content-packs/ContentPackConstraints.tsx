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
import React from 'react';
import { Set } from 'immutable';

import { DataTable, Icon } from 'components/common';
import { Badge } from 'components/bootstrap';

type ContentPackConstraintsProps = {
  constraints?: any | any[];
  isFulfilled?: boolean;
};

class ContentPackConstraints extends React.Component<
  ContentPackConstraintsProps,
  {
    [key: string]: any;
  }
> {
  static defaultProps = {
    constraints: Set(),
    isFulfilled: false,
  };

  _rowFormatter = (item) => {
    const { isFulfilled } = this.props;
    const constraint = item.constraint || item;

    constraint.fulfilled = isFulfilled || constraint.fulfilled;
    const name = constraint.type === 'server-version' ? 'Graylog' : constraint.plugin;

    return (
      <tr key={constraint.id}>
        <td>{name}</td>
        <td>{constraint.type}</td>
        <td>{constraint.version}</td>
        <td>
          <Badge bsStyle={constraint.fulfilled ? 'success' : 'danger'}>
            <Icon name={constraint.fulfilled ? 'check_circle' : 'cancel'} />
          </Badge>
        </td>
      </tr>
    );
  };

  render() {
    const { constraints: unfilteredConstraints } = this.props;
    const headers = ['Name', 'Type', 'Version', 'Fulfilled'];
    let constraints = unfilteredConstraints.map((constraint) => {
      const newConstraint = constraint.constraint || constraint;

      newConstraint.fulfilled = constraint.fulfilled;

      return newConstraint;
    });

    if (typeof constraints.toArray === 'function') {
      constraints = constraints.toArray();
    }

    return (
      <div>
        <h2>Constraints</h2>
        <br />
        <br />
        <DataTable
          id="content-packs-constraints"
          headers={headers}
          headerCellFormatter={(header) => <th>{header}</th>}
          sortBy={(row) => (row.constraint ? row.constraint.type : row.type)}
          dataRowFormatter={this._rowFormatter}
          rows={constraints}
          filterKeys={[]}
        />
      </div>
    );
  }
}

export default ContentPackConstraints;
