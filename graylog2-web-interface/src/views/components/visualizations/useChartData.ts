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
import { useMemo } from 'react';
import type { Optional } from 'utility-types';

import type { ChartDataConfig } from 'views/components/visualizations/ChartData';
import { chartData } from 'views/components/visualizations/ChartData';
import type { Rows } from 'views/logic/searchtypes/pivot/PivotHandler';
import useUserDateTime from 'hooks/useUserDateTime';
import useMapKeys from 'views/components/visualizations/useMapKeys';

const useChartData = (rows: Rows, config: Optional<ChartDataConfig, 'formatTime'>) => {
  const { formatTime } = useUserDateTime();
  const mapKeys = useMapKeys();

  return useMemo(
    () =>
      chartData(rows, {
        formatTime,
        mapKeys,
        ...config,
      }),
    [config, formatTime, mapKeys, rows],
  );
};

export default useChartData;
