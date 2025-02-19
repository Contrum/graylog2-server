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
import * as React from 'react';
import type * as Immutable from 'immutable';

import { MessageDetailsDefinitionList } from 'components/common';

type Props = {
  timestamp: string;
  receivedBy: React.ReactElement;
  index: string;
  streams: Immutable.Set<React.ReactElement>;
  assets: React.ReactElement;
};

const MessageMetadata = ({ timestamp, receivedBy, index, streams, assets }: Props) => (
  <MessageDetailsDefinitionList>
    {timestamp}
    {receivedBy}

    <dt>Stored in index</dt>
    <dd>{index || 'Message is not stored'}</dd>

    {streams.size > 0 && (
      <>
        <dt>Routed into streams</dt>
        <dd className="stream-list">
          <ul>{streams.toArray()}</ul>
        </dd>
      </>
    )}

    {assets}
  </MessageDetailsDefinitionList>
);

export default MessageMetadata;
