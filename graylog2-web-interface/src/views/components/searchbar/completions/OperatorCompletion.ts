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
import trim from 'lodash/trim';

import {
  isKeywordOperator,
  isTypeString,
  isTypeKeyword,
  isTypeText,
} from 'views/components/searchbar/completions/token-helper';

import type { Completer, CompleterContext } from '../SearchBarAutocompletions';
import type { CompletionResult, Token } from '../queryinput/ace-types';

const combiningOperators: Array<CompletionResult> = [
  {
    name: 'AND',
    value: 'AND ',
    score: 10,
    meta: 'operator',
  },
  {
    name: 'OR',
    value: 'OR ',
    score: 10,
    meta: 'operator',
  },
];

const operators: Array<CompletionResult> = [
  {
    name: 'NOT',
    value: 'NOT ',
    score: 10,
    meta: 'operator',
  },
];

const _matchesFieldName = (prefix) => (field) => field.name.indexOf(prefix) >= 0;

const _lastNonEmptyToken = (tokens: Array<Token>, currentTokenIdx: number): Token | undefined | null =>
  tokens
    .slice(0, currentTokenIdx)
    .reverse()
    .find((token) => token.type !== 'text' || trim(token.value) !== '');

class OperatorCompletion implements Completer {
  // eslint-disable-next-line class-methods-use-this
  getCompletions = ({
    currentToken,
    prevToken,
    prefix,
    tokens,
    currentTokenIdx,
  }: CompleterContext): Array<CompletionResult> => {
    if (
      isTypeKeyword(currentToken) ||
      isTypeString(currentToken) ||
      !tokens?.length ||
      !prefix ||
      (isKeywordOperator(prevToken) && prevToken.value === 'NOT')
    ) {
      return [];
    }

    const lastNonEmptyToken = _lastNonEmptyToken(tokens, currentTokenIdx);

    if (!lastNonEmptyToken || (lastNonEmptyToken && lastNonEmptyToken.type === 'keyword.operator')) {
      const matchesFieldName = _matchesFieldName(prefix);

      return operators.filter(matchesFieldName);
    }

    if (prevToken && (isTypeString(prevToken) || isTypeText(prevToken))) {
      const matchesFieldName = _matchesFieldName(prefix);

      return [...combiningOperators, ...operators].filter(matchesFieldName);
    }

    return [];
  };
}

export default OperatorCompletion;
