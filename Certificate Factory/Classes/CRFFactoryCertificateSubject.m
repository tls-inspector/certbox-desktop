#import "CRFFactoryCertificateSubject.h"

@implementation CRFFactoryCertificateSubject

- (X509_NAME *) x509Name {
    X509_NAME * name = X509_NAME_new();

    // Now to add the subject name fields to the certificate
    // I use a macro here to make it cleaner.
#define addName(field, value) X509_NAME_add_entry_by_txt(name, field,  MBSTRING_ASC, (unsigned char *)value, -1, -1, 0); NSLog(@"%s: %s", field, value);

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

@end
