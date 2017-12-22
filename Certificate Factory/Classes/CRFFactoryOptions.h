#import <Foundation/Foundation.h>
#import "CRFFactoryCertificateRequest.h"
#import "CRFExportOptions.h"

@interface CRFFactoryOptions : NSObject

@property (strong, nonatomic, nonnull) CRFExportOptions * exportOptions;
@property (strong, nonatomic, nullable) CRFFactoryCertificateRequest * rootRequest;
@property (strong, nonatomic, nullable) NSArray<CRFFactoryCertificateRequest *> * serverRequests;

@end
