#import "CRFFactoryOptions.h"

@implementation CRFFactoryOptions

- (void) setServerRequests:(NSArray<CRFCertificateRequest *> *)serverRequests {
    _serverRequests = serverRequests;

    for (CRFCertificateRequest * request in serverRequests) {
        request.issuer = self.rootRequest.subject;
    }
}

@end
