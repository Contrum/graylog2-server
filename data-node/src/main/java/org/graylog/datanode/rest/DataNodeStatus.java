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
package org.graylog.datanode.rest;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.graylog.datanode.configuration.DatanodeDirectories;
import org.graylog2.cluster.nodes.DataNodeDto;
import org.graylog2.plugin.Version;

public record DataNodeStatus(@JsonIgnore Version appVersion, SystemInfo operatingSystem, StatusResponse opensearch,
                             DatanodeDirectories datanodeDirectories, DataNodeDto dto) {

    DataNodeStatus(Version appVersion, StatusResponse opensearch, DatanodeDirectories datanodeDirectories, DataNodeDto dto) {
        this(appVersion, new SystemInfo(), opensearch, datanodeDirectories, dto);
    }

    @JsonProperty
    public String dataNodeVersion() {
        return this.appVersion.toString();
    }

    record SystemInfo(String osName, String osVersion, String javaVersion, String userName) {
        public SystemInfo() {
            this(System.getProperty("os.name"), System.getProperty("os.version"), System.getProperty("java.version"), System.getProperty("user.name"));
        }
    }

}
