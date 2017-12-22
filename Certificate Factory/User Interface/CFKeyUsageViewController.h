#import <Cocoa/Cocoa.h>
#import "CRFKeyUsage.h"

@interface CFKeyUsageViewController : NSViewController

- (NSArray<CRFKeyUsage *> *) getUsage;

- (void) defaultRoot;
- (void) defaultCert;

@end
