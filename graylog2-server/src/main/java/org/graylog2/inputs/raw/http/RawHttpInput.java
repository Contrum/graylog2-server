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
package org.graylog2.inputs.raw.http;

import com.codahale.metrics.MetricRegistry;
import com.google.inject.assistedinject.Assisted;
import com.google.inject.assistedinject.AssistedInject;
import jakarta.inject.Inject;
import org.graylog2.inputs.codecs.RawCodec;
import org.graylog2.inputs.transports.RawHttpTransport;
import org.graylog2.plugin.LocalMetricRegistry;
import org.graylog2.plugin.ServerStatus;
import org.graylog2.plugin.configuration.Configuration;
import org.graylog2.plugin.inputs.MessageInput;

public class RawHttpInput extends MessageInput {

    private static final String NAME = "Raw HTTP";

    @AssistedInject
    public RawHttpInput(MetricRegistry metricRegistry,
                        @Assisted Configuration configuration,
                        RawHttpTransport.Factory httpTransportFactory,
                        RawCodec.Factory rawCodecFactory, LocalMetricRegistry localRegistry, Config config, Descriptor descriptor, ServerStatus serverStatus) {
        super(metricRegistry, configuration, httpTransportFactory.create(configuration),
                localRegistry,
                rawCodecFactory.create(configuration), config, descriptor, serverStatus);
    }

    public interface Factory extends MessageInput.Factory<RawHttpInput> {
        @Override
        RawHttpInput create(Configuration configuration);

        @Override
        Config getConfig();

        @Override
        Descriptor getDescriptor();
    }

    public static class Descriptor extends MessageInput.Descriptor {
        @Inject
        public Descriptor() {
            super(NAME, false, "");
        }
    }

    public static class Config extends MessageInput.Config {
        @Inject
        public Config(RawHttpTransport.Factory transport, RawCodec.Factory codec) {
            super(transport.getConfig(), codec.getConfig());
        }
    }
}
