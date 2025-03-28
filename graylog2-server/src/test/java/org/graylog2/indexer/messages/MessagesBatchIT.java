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
package org.graylog2.indexer.messages;

import com.google.common.base.Strings;
import org.graylog.failure.FailureSubmissionService;
import org.graylog.testing.elasticsearch.ElasticsearchBaseTest;
import org.graylog2.indexer.IndexSet;
import org.graylog2.plugin.MessageFactory;
import org.graylog2.plugin.TestMessageFactory;
import org.graylog2.system.processing.ProcessingStatusRecorder;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

public abstract class MessagesBatchIT extends ElasticsearchBaseTest {
    private static final String INDEX_NAME = "messages_it_deflector";

    protected static final IndexSet indexSet = new MessagesTestIndexSet();
    protected Messages messages;
    private final MessageFactory messageFactory = new TestMessageFactory();

    protected MessagesAdapter createMessagesAdapter() {
        return searchServer().adapters().messagesAdapter();
    }

    @Mock
    private FailureSubmissionService failureSubmissionService;

    @Before
    public void setUp() throws Exception {
        client().deleteIndices(INDEX_NAME);
        client().createIndex(INDEX_NAME);
        client().waitForGreenStatus(INDEX_NAME);
        messages = new Messages(mock(TrafficAccounting.class), createMessagesAdapter(), mock(ProcessingStatusRecorder.class),
                failureSubmissionService);
    }

    @After
    public void tearDown() {
        client().cleanUp();
    }

    @Test
    public void testIfLargeBatchesGetSplitUpOnCircuitBreakerExceptions() {
        // This test assumes that ES is running with only 256MB heap size.
        // This will trigger the circuit breaker when we are trying to index large batches
        final int MESSAGECOUNT = 50;
        // Each Message is about 1 MB
        final List<MessageWithIndex> largeMessageBatch = createMessageBatch(1024 * 1024, MESSAGECOUNT);
        var results = this.messages.bulkIndex(largeMessageBatch);

        client().refreshNode(); // wait for ES to finish indexing

        assertThat(results.errors()).isEmpty();
        assertThat(messageCount(INDEX_NAME)).isEqualTo(MESSAGECOUNT);
    }

    protected long messageCount(String indexName) {
        return searchServer().adapters().countsAdapter().totalCount(Collections.singletonList(indexName));
    }

    private DateTime now() {
        return DateTime.now(DateTimeZone.UTC);
    }

    private ArrayList<MessageWithIndex> createMessageBatch(int size, int count) {
        final ArrayList<MessageWithIndex> messageList = new ArrayList<>();

        final String message = Strings.repeat("A", size);
        for (int i = 0; i < count; i++) {
            messageList.add(new MessageWithIndex(ImmutableMessage.wrap(messageFactory.createMessage(i + message, "source", now())), indexSet));
        }
        return messageList;
    }
}
