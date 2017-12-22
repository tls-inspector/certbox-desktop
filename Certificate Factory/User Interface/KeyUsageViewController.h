#import <Cocoa/Cocoa.h>
#import "CRFKeyUsage.h"

@interface KeyUsageViewController : NSViewController

@property (weak) IBOutlet NSButton *crlSign;
@property (weak) IBOutlet NSButton *clientAuth;
@property (weak) IBOutlet NSButton *digitalSignature;
@property (weak) IBOutlet NSButton *dataEncipherment;
@property (weak) IBOutlet NSButton *ocspSigning;
@property (weak) IBOutlet NSButton *certificateSign;
@property (weak) IBOutlet NSButton *email;
@property (weak) IBOutlet NSButton *decipherOnly;
@property (weak) IBOutlet NSButton *nonRepudiation;
@property (weak) IBOutlet NSButton *codeSign;
@property (weak) IBOutlet NSButton *keyAgreement;
@property (weak) IBOutlet NSButton *keyEngipherment;
@property (weak) IBOutlet NSButton *encipherOnly;
@property (weak) IBOutlet NSButton *serverAuth;
@property (weak) IBOutlet NSButton *timestamping;

- (NSArray<CRFKeyUsage *> *) getUsage;

- (void) defaultRoot;
- (void) defaultCert;

@end
