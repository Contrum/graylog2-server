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
import { PluginStore } from 'graylog-web-plugin/plugin';

import type { Output } from 'stores/outputs/OutputsStore';
import type { Stream, StreamRule } from 'stores/streams/StreamsStore';
import type { ColumnRenderers } from 'components/common/EntityDataTable';
import IndexSetCell from 'components/streams/StreamsOverview/cells/IndexSetCell';
import TitleCell from 'components/streams/StreamsOverview/cells/TitleCell';
import ThroughputCell from 'components/streams/StreamsOverview/cells/ThroughputCell';
import type { IndexSet } from 'stores/indices/IndexSetsStore';

import StatusCell from './cells/StatusCell';
import StreamRulesCell from './cells/StreamRulesCell';
import PipelinesCell from './cells/PipelinesCell';
import OutputsCell from './cells/OutputsCell';
import ArchivingsCell from './cells/ArchivingsCell';

const streamDataWarehouseColumnRenderer = PluginStore.exports('dataWarehouse')?.[0]?.streamDataWarehouseTableElements.columnRenderer;

const customColumnRenderers = (indexSets: Array<IndexSet>): ColumnRenderers<Stream> => ({
  attributes: {
    title: {
      renderCell: (_title: string, stream) => <TitleCell stream={stream} />,
      width: 0.5,
    },
    index_set_title: {
      renderCell: (_index_set_title: string, stream) => <IndexSetCell indexSets={indexSets} stream={stream} />,
      width: 0.3,
    },
    throughput: {
      renderCell: (_throughput: string, stream) => <ThroughputCell stream={stream} />,
      staticWidth: 130,
    },
    disabled: {
      renderCell: (_disabled: string, stream) => <StatusCell stream={stream} />,
      staticWidth: 130,
    },
    rules: {
      renderCell: (_rules: StreamRule[], stream) => <StreamRulesCell stream={stream} />,
      staticWidth: 100,
    },
    pipelines: {
      renderCell: (_pipeline: any[], stream) => <PipelinesCell stream={stream} />,
      staticWidth: 100,
    },
    outputs: {
      renderCell: (_outputs: Output[], stream) => <OutputsCell stream={stream} />,
      staticWidth: 100,
    },
    archiving: {
      renderCell: (_archiving:boolean, stream) => <ArchivingsCell stream={stream} indexSets={indexSets} />,
      staticWidth: 100,
    },
    ...(streamDataWarehouseColumnRenderer || {}),
  },
});

export default customColumnRenderers;
