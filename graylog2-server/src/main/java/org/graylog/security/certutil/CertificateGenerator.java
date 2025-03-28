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
package org.graylog.security.certutil;

import org.bouncycastle.asn1.x500.X500Name;
import org.bouncycastle.asn1.x500.X500NameBuilder;
import org.bouncycastle.asn1.x500.style.BCStyle;
import org.bouncycastle.asn1.x509.BasicConstraints;
import org.bouncycastle.asn1.x509.Extension;
import org.bouncycastle.asn1.x509.GeneralName;
import org.bouncycastle.asn1.x509.GeneralNames;
import org.bouncycastle.cert.X509CertificateHolder;
import org.bouncycastle.cert.jcajce.JcaX509CertificateConverter;
import org.bouncycastle.cert.jcajce.JcaX509v3CertificateBuilder;
import org.bouncycastle.operator.ContentSigner;
import org.bouncycastle.operator.jcajce.JcaContentSignerBuilder;

import java.math.BigInteger;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import static org.graylog.security.certutil.CertConstants.KEY_GENERATION_ALGORITHM;
import static org.graylog.security.certutil.CertConstants.SIGNING_ALGORITHM;

public class CertificateGenerator {
    public static KeyPair generate(CertRequest request) throws Exception {
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance(KEY_GENERATION_ALGORITHM);
        keyGen.initialize(4096);
        java.security.KeyPair certKeyPair = keyGen.generateKeyPair();

        final X500Name name = getX500Name(request.cnName());

        BigInteger serialNumber = new BigInteger(UUID.randomUUID().toString().replace("-", ""), 16);
        Instant validFrom = Instant.now();

        Instant validUntil = validFrom.plus(request.validity());

        // If there is no issuer, we self-sign our certificate.
        X500Name issuerName;
        PrivateKey issuerKey;
        if (request.issuer() == null) {
            issuerName = name;
            issuerKey = certKeyPair.getPrivate();
        } else {
            issuerName = new X500Name(request.issuer().certificate().getSubjectX500Principal().getName());
            issuerKey = request.issuer().privateKey();
        }

        JcaX509v3CertificateBuilder builder = new JcaX509v3CertificateBuilder(
                issuerName,
                serialNumber,
                Date.from(validFrom), Date.from(validUntil),
                name, certKeyPair.getPublic());

        // Make the certificate to a Cert Authority to sign more certs when needed
        if (request.isCA()) {
            builder.addExtension(Extension.basicConstraints, true, new BasicConstraints(true));
        }

        if (!request.subjectAlternativeNames().isEmpty()) {
            GeneralName[] generalNames = request.subjectAlternativeNames().stream()
                    .map(s -> new GeneralName(GeneralName.dNSName, s))
                    .toArray(GeneralName[]::new);
            builder.addExtension(Extension.subjectAlternativeName, false,
                    new GeneralNames(generalNames));
        }

        ContentSigner signer = new JcaContentSignerBuilder(SIGNING_ALGORITHM).build(issuerKey);
        X509CertificateHolder certHolder = builder.build(signer);
        X509Certificate cert = new JcaX509CertificateConverter().getCertificate(certHolder);
        return new KeyPair(certKeyPair.getPrivate(), certKeyPair.getPublic(), cert);
    }

    private static X500Name getX500Name(String cname) {
        X500NameBuilder builder = new X500NameBuilder(BCStyle.INSTANCE);
        builder.addRDN(BCStyle.CN, cname);
        return builder.build();
    }
}
