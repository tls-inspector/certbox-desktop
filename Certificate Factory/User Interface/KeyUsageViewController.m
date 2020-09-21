#import "KeyUsageViewController.h"

@interface KeyUsageViewController ()

@end

@implementation KeyUsageViewController

- (void) viewDidLoad {
    [super viewDidLoad];
}

- (NSArray<CRFKeyUsage *> *) getUsage {
    NSMutableArray<CRFKeyUsage *> * usage = [NSMutableArray new];
    if (self.crlSign.state == NSControlStateValueOn) {
        [usage addObject:[CRFKeyUsage usageWithValue:@"cRLSign" extended:NO]];
    }
    if (self.clientAuth.state == NSControlStateValueOn) {
        [usage addObject:[CRFKeyUsage usageWithValue:@"clientAuth" extended:YES]];
    }
    if (self.digitalSignature.state == NSControlStateValueOn) {
        [usage addObject:[CRFKeyUsage usageWithValue:@"digitalSignature" extended:NO]];
    }
    if (self.dataEncipherment.state == NSControlStateValueOn) {
        [usage addObject:[CRFKeyUsage usageWithValue:@"dataEncipherment" extended:NO]];
    }
    if (self.ocspSigning.state == NSControlStateValueOn) {
        [usage addObject:[CRFKeyUsage usageWithValue:@"OCSPSigning" extended:YES]];
    }
    if (self.certificateSign.state == NSControlStateValueOn) {
        [usage addObject:[CRFKeyUsage usageWithValue:@"keyCertSign" extended:NO]];
    }
    if (self.email.state == NSControlStateValueOn) {
        [usage addObject:[CRFKeyUsage usageWithValue:@"emailProtection" extended:YES]];
    }
    if (self.decipherOnly.state == NSControlStateValueOn) {
        [usage addObject:[CRFKeyUsage usageWithValue:@"decipherOnly" extended:NO]];
    }
    if (self.nonRepudiation.state == NSControlStateValueOn) {
        [usage addObject:[CRFKeyUsage usageWithValue:@"nonRepudiation" extended:NO]];
    }
    if (self.codeSign.state == NSControlStateValueOn) {
        [usage addObject:[CRFKeyUsage usageWithValue:@"codeSigning" extended:YES]];
    }
    if (self.keyAgreement.state == NSControlStateValueOn) {
        [usage addObject:[CRFKeyUsage usageWithValue:@"keyAgreement" extended:NO]];
    }
    if (self.keyEngipherment.state == NSControlStateValueOn) {
        [usage addObject:[CRFKeyUsage usageWithValue:@"keyEncipherment" extended:NO]];
    }
    if (self.encipherOnly.state == NSControlStateValueOn) {
        [usage addObject:[CRFKeyUsage usageWithValue:@"encipherOnly" extended:NO]];
    }
    if (self.serverAuth.state == NSControlStateValueOn) {
        [usage addObject:[CRFKeyUsage usageWithValue:@"serverAuth" extended:YES]];
    }
    if (self.timestamping.state == NSControlStateValueOn) {
        [usage addObject:[CRFKeyUsage usageWithValue:@"timeStamping" extended:YES]];
    }
    return usage;
}

- (void) defaultRoot {
    self.digitalSignature.state = self.certificateSign.state = NSControlStateValueOn;
}

- (void) defaultCert {
    self.digitalSignature.state = self.keyEngipherment.state = self.serverAuth.state = self.clientAuth.state = NSControlStateValueOn;
}

@end
