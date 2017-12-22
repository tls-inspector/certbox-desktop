#import "CRFFactoryOptions.h"

@implementation CRFFactoryOptions

- (void) setServerRequests:(NSArray<CRFFactoryCertificateRequest *> *)serverRequests {
    _serverRequests = serverRequests;

    for (CRFFactoryCertificateRequest * request in serverRequests) {
        request.issuer = self.rootRequest.subject;
    }
}

@end
