#import "CRFFactoryCertificateSubject.h"

@implementation CRFFactoryCertificateSubject

static const int CERTIFICATE_SUBJECT_MAX_LENGTH = 150;

- (X509_NAME *) x509Name {
    X509_NAME * name = X509_NAME_new();

    // Now to add the subject name fields to the certificate
    // I use a macro here to make it cleaner.
#define addName(field, value) if (value != nil) { X509_NAME_add_entry_by_txt(name, field,  MBSTRING_ASC, (unsigned char *)value, -1, -1, 0); NSLog(@"%s: %s", field, value); }

    // The domain name or IP address that the certificate is issued for.
    addName("CN", self.commonName.UTF8String);

    // The organizational unit for the cert. Usually this is a department.
    addName("OU", self.department.UTF8String);

    // The organization of the cert.
    addName("O",  self.organization.UTF8String);

    // The city of the organization.
    addName("L",  self.city.UTF8String);

    // The state/province of the organization.
    addName("ST",  self.state.UTF8String);

    // The country (ISO 3166) of the organization
    addName("C",  self.country.UTF8String);

    return name;
}

+ (CRFFactoryCertificateSubject * _Nullable) subjectFromX509:(X509 *)cert {
    CRFFactoryCertificateSubject * subject = [CRFFactoryCertificateSubject new];
    NSString * (^getNID)(int) = ^NSString * (int nid) {
        X509_NAME * name = X509_get_subject_name(cert);
        char * value = malloc(CERTIFICATE_SUBJECT_MAX_LENGTH);
        int length = X509_NAME_get_text_by_NID(name, nid, value, CERTIFICATE_SUBJECT_MAX_LENGTH);
        if (length < 0) {
            return nil;
        }

        NSString * subjectValue = [[NSString alloc] initWithBytes:value length:length encoding:NSUTF8StringEncoding];
        free(value);
        return subjectValue;
    };

#define add_subject(k, nid) value = getNID(nid); if (value != nil) { [subject setValue:value forKey:k]; }
    NSString * value;
    add_subject(@"commonName", NID_commonName);
    add_subject(@"country", NID_countryName);
    add_subject(@"state", NID_stateOrProvinceName);
    add_subject(@"city", NID_localityName);
    add_subject(@"organization", NID_organizationName);
    add_subject(@"department", NID_organizationalUnitName);

    return subject;
}

- (NSString *) description {
    return [NSString stringWithFormat:@"country: '%@', state: '%@', city: '%@', organization: '%@', department: '%@', commonName: '%@'",
        self.country,
        self.state,
        self.city,
        self.organization,
        self.department,
        self.commonName];
}

@end
