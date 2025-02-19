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
import Plotly from 'plotly.js/lib/core';
import Bar from 'plotly.js/lib/bar';
import Pie from 'plotly.js/lib/pie';
import Heatmap from 'plotly.js/lib/heatmap';
import Scatter from 'plotly.js/lib/scatter';
import Scatterpolar from 'plotly.js/lib/scatterpolar';

// @ts-ignore
Plotly.register([Bar, Pie, Scatter, Heatmap, Scatterpolar]);

export default Plotly;
