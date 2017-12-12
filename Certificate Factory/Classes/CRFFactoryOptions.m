#import "CRFFactoryOptions.h"

@implementation CRFFactoryOptions

- (void) setServerRequest:(CRFFactoryCertificateRequest *)serverRequest {
    _serverRequest = serverRequest;

    if (self.caRequest != nil) {
        _serverRequest.issuer = self.caRequest.subject;
    }
}

@end
