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

import { useRef } from 'react';
import * as React from 'react';
import styled from 'styled-components';

import type { Stream } from 'stores/streams/StreamsStore';
import { CountBadge } from 'components/common';

const StyledCountBadge = styled(CountBadge)`
  cursor: pointer;
`;

type Props = {
  stream: Stream
}

const OutputsCell = ({ stream }: Props) => {
  const buttonRef = useRef();

  if (stream.is_default || !stream.is_editable) {
    return null;
  }

  return (
    <StyledCountBadge ref={buttonRef} title="Stream Outputs">
      {stream.outputs?.length || 0}
    </StyledCountBadge>
  );
};

export default OutputsCell;
