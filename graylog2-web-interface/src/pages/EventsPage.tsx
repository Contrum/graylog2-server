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

import { Col, Row } from 'components/bootstrap';
import { DocumentTitle, PageHeader } from 'components/common';
import DocsHelper from 'util/DocsHelper';
import EventsPageNavigation from 'components/events/EventsPageNavigation';
import EventsEntityTable from 'components/events/EventsEntityTable';

const EventsPage = () => (
  <DocumentTitle title="Alerts &amp; Events">
    <EventsPageNavigation />
    <PageHeader
      title="Alerts &amp; Events"
      documentationLink={{
        title: 'Alerts documentation',
        path: DocsHelper.PAGES.ALERTS,
      }}>
      <span>
        Define Events through different conditions. Add Notifications to Events that require your attention to create
        Alerts.
      </span>
    </PageHeader>

    <Row className="content">
      <Col md={12}>
        <EventsEntityTable />
      </Col>
    </Row>
  </DocumentTitle>
);

export default EventsPage;
