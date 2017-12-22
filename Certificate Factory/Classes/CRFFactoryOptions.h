#import <Foundation/Foundation.h>
#import "CRFCertificateRequest.h"
#import "CRFExportOptions.h"

@interface CRFFactoryOptions : NSObject

@property (strong, nonatomic, nonnull) CRFExportOptions * exportOptions;
@property (strong, nonatomic, nullable) CRFCertificateRequest * rootRequest;
@property (strong, nonatomic, nullable) NSArray<CRFCertificateRequest *> * serverRequests;

@end
