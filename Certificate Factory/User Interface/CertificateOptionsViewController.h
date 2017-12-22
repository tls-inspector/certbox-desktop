#import <Cocoa/Cocoa.h>
#import "CRFCertificateRequest.h"

@interface CertificateOptionsViewController : NSViewController

@property (nonatomic) BOOL root;

- (void) enableAllControls;
- (void) disableAllControls;
- (CRFCertificateRequest * _Nullable) getRequest;
- (NSError * _Nullable) validationError;

@property (nonatomic, strong, nullable) CRFCertificateRequest * importedRequest;

@end
