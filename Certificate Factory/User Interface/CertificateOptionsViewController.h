#import <Cocoa/Cocoa.h>
#import "CRFFactoryCertificateRequest.h"

@interface CertificateOptionsViewController : NSViewController

@property (nonatomic) BOOL hideSAN;

- (void) enableAllControls;
- (void) disableAllControls;
- (CRFFactoryCertificateRequest * _Nullable) getRequest;
- (NSError * _Nullable) validationError;

@end
