#import "ViewController.h"
#import "CertificateOptionsViewController.h"
#import "CRFFactory.h"
#import "CRFRandom.h"

@interface ViewController()

@property (strong, nonatomic) CRFFactory * factory;
@property (weak) IBOutlet NSSecureTextField *passwordInput;
@property (weak) IBOutlet NSSegmentedControl *exportTypeToggle;
@property (weak) IBOutlet NSButton *generateCACheckbox;
@property (weak) IBOutlet NSView *caOptionsView;
@property (weak) IBOutlet NSView *serverOptionsView;
@property (weak) IBOutlet NSButton *generateButton;
@property (weak) IBOutlet NSTextField *validationMessage;

@property (strong, nonatomic) CertificateOptionsViewController * caOptionsController;
@property (strong, nonatomic) CertificateOptionsViewController * serverOptionsController;
@property (nonatomic) BOOL allowInvalidCertificates;

@end

@implementation ViewController

- (void) viewDidLoad {
    [super viewDidLoad];
    
    self.caOptionsController = [self.storyboard instantiateControllerWithIdentifier:@"Certificate Options"];
    self.caOptionsController.hideSAN = YES;
    self.serverOptionsController = [self.storyboard instantiateControllerWithIdentifier:@"Certificate Options"];
    [self.caOptionsView addSubview:self.caOptionsController.view];
    [self.serverOptionsView addSubview:self.serverOptionsController.view];
    [NSNotificationCenter.defaultCenter addObserver:self selector:@selector(validate) name:NOTIFICATION_VALIDATE object:nil];

    [self test];

    [self validate];
}

- (void) test {
    CRFFactoryCertificateRequest * caRequest = [CRFFactoryCertificateRequest new];
    caRequest.serial = @"1";
    caRequest.keyType = KEY_ALG_ECDSA;
    caRequest.dateStart = [NSDate dateWithTimeIntervalSince1970:762854400];
    caRequest.dateEnd = [NSDate dateWithTimeIntervalSince1970:1583395200];
    caRequest.subject = [CRFFactoryCertificateSubject new];
    caRequest.subject.country = @"C";
    caRequest.subject.state = @"British Columbia";
    caRequest.subject.city = @"Vancouver";
    caRequest.subject.organization = @"ecn.io";
    caRequest.subject.department = @"Certificate Authority";
    caRequest.subject.commonName = @"ecn.io Internal Root CA";

    CRFFactoryCertificateRequest * serverRequest = [CRFFactoryCertificateRequest new];
    serverRequest.serial = @"473432";
    serverRequest.keyType = KEY_ALG_ECDSA;
    serverRequest.dateStart = [NSDate dateWithTimeIntervalSince1970:762854400];
    serverRequest.dateEnd = [NSDate dateWithTimeIntervalSince1970:1583395200];
    serverRequest.subject = [CRFFactoryCertificateSubject new];
    serverRequest.subject.country = @"C";
    serverRequest.subject.state = @"British Columbia";
    serverRequest.subject.city = @"Vancouver";
    serverRequest.subject.organization = @"ecn.io";
    serverRequest.subject.department = @"Certificate Authority";
    serverRequest.subject.commonName = @"*.ecn.io";

    NSArray<SANObject *> * sans = @[
                                    [SANObject newDNSObject:@"yvr.ecn.io"],
                                    [SANObject newDNSObject:@"*.yvr.ecn.io"],
                                    [SANObject newDNSObject:@"yve.ecn.io"],
                                    [SANObject newDNSObject:@"*.yve.ecn.io"],
                                    [SANObject newDNSObject:@"sfo.ecn.io"],
                                    [SANObject newDNSObject:@"*.sfo.ecn.io"],
                                    [SANObject object:SANObjectTypeEmail value:@"ian@ecnepsnai.com"]
                                    ];
    serverRequest.sans = sans;

    CRFFactoryOptions * options = [CRFFactoryOptions new];
    options.caRequest = caRequest;
    options.caRequest.isCA = YES;
    options.serverRequest = serverRequest;
    options.exportType = EXPORT_PEM;
    options.exportPassword = @"Real43Life";

    self.factory = [CRFFactory factoryWithOptions:options];
    [self.factory generateAndSave:^(NSString * _Nullable savePath, NSError * _Nullable error) {
        //
    }];
}

- (IBAction) toggleAllowInvalidCertificates:(NSMenuItem *)sender {
    if (sender.state == NSControlStateValueOff) {
        [sender setState:NSControlStateValueOn];
        self.allowInvalidCertificates = YES;
    } else {
        [sender setState:NSControlStateValueOff];
        self.allowInvalidCertificates = NO;
    }
    [self validate];
}

- (void) validate {
    if (self.allowInvalidCertificates) {
        self.generateButton.enabled = YES;
        self.validationMessage.hidden = YES;
        return;
    }

    self.generateButton.enabled = NO;
    self.validationMessage.hidden = NO;

    if ([self generateCA]) {
        NSError * caValidationError = self.caOptionsController.validationError;
        if (caValidationError != nil) {
            self.validationMessage.stringValue = caValidationError.localizedDescription;
            return;
        }
    }
    
    NSError * serverValidationError = self.serverOptionsController.validationError;
    if (serverValidationError != nil) {
        self.validationMessage.stringValue = serverValidationError.localizedDescription;
        return;
    }
    
    if ([self.passwordInput stringValue].length == 0) {
        self.validationMessage.stringValue = @"Must specify export password";
        return;
    }

    self.generateButton.enabled = YES;
    self.validationMessage.hidden = YES;
}

- (BOOL) generateCA {
    return self.generateCACheckbox.state == NSControlStateValueOn;
}

- (IBAction)toggleGenerateCA:(NSButton *)sender {
    if (sender.state == NSControlStateValueOn) {
        [self.caOptionsController enableAllControls];
        self.caOptionsView.alphaValue = 1.0f;
    } else {
        [self.caOptionsController disableAllControls];
        self.caOptionsView.alphaValue = 0.5f;
    }
    [self validate];
}

- (IBAction) randomPasswordButton:(id)sender {
    NSString * password = [CRFRandom randomStringOfLength:16];
    [self.passwordInput setStringValue:password];
    [self validate];

    NSAlert * alert = NSAlert.new;
    [alert setMessageText:@"Export Password"];
    [alert setInformativeText:password];
    [alert addButtonWithTitle:@"OK"];
    [alert addButtonWithTitle:@"Cancel"];
    [alert setAlertStyle:NSAlertStyleInformational];
    [alert beginSheetModalForWindow:self.view.window completionHandler:nil];
}

- (IBAction) generateButton:(NSButton *)sender {
    sender.enabled = NO;

    CRFFactoryOptions * options = CRFFactoryOptions.new;
    options.exportPassword = self.passwordInput.stringValue;
    options.exportType = self.exportTypeToggle.selectedSegment == 0 ? EXPORT_PEM : EXPORT_PKCS12;

    if ([self generateCA]) {
        options.caRequest = [self.caOptionsController getRequest];
        options.caRequest.isCA = YES;
    }
    options.serverRequest = [self.serverOptionsController getRequest];
    self.factory = [CRFFactory factoryWithOptions:options];

    [self.factory generateAndSave:^(NSString * _Nullable savePath, NSError * _Nullable error) {
        NSLog(@"Save Path: %@, error: %@", savePath, error);
    }];

    /*
    
    CRFFactoryOptions * options = CRFFactoryOptions.new;
    options.serial = self.serialInput.stringValue;
    options.keyType = self.keyAlgToggle.selectedSegment == 0 ? KEY_ALG_RSA : KEY_ALG_ECDSA;
    options.dateStart = self.dateFromInput.dateValue;
    options.dateEnd = self.dateToInput.dateValue;
    options.country = self.countryInput.stringValue;
    options.city = self.cityInput.stringValue;
    options.state = self.stateInput.stringValue;
    options.organization = self.orgInput.stringValue;
    options.department = self.departmentInput.stringValue;
    options.commonName = self.commonNameInput.stringValue;
    options.sans = self.SANs;
    options.exportPassword = self.passwordInput.stringValue;
    options.exportType = self.exportTypeToggle.selectedSegment == 0 ? EXPORT_PEM : EXPORT_PKCS12;

    self.factory = [CRFFactory factoryWithOptions:options];

    [self.factory generateAndSave:^(NSString * _Nullable savePath, NSError * _Nullable error) {
        sender.enabled = YES;
        if (error) {
            NSAlert * alert = NSAlert.new;
            [alert addButtonWithTitle:@"Dismiss"];
            alert.messageText = @"Error generating certificate and/or key.";
            alert.informativeText = error.localizedDescription;
            alert.alertStyle = NSAlertStyleCritical;
            [alert beginSheetModalForWindow:[self.view window] completionHandler:nil];
        } else {
            if (self.exportTypeToggle.selectedSegment == 0) {
                NSOpenPanel * panel = NSOpenPanel.openPanel;
                panel.canChooseFiles = NO;
                panel.canChooseDirectories = YES;
                panel.prompt = @"Save";
                [panel beginSheetModalForWindow:[self.view window] completionHandler:^(NSInteger result) {
                    if (result == NSModalResponseOK) {
                        NSString * exportPath = [panel.URL path];

                        NSString * oldKeyPath = [NSString stringWithFormat:@"%@/server.key", savePath];
                        NSString * oldCertPath = [NSString stringWithFormat:@"%@/server.crt", savePath];

                        NSString * newKeyPath = [NSString stringWithFormat:@"%@/%@.key", exportPath, self.commonNameInput.stringValue];
                        NSString * newCertPath = [NSString stringWithFormat:@"%@/%@.crt", exportPath, self.commonNameInput.stringValue];

                        rename(oldKeyPath.fileSystemRepresentation, newKeyPath.fileSystemRepresentation);
                        rename(oldCertPath.fileSystemRepresentation, newCertPath.fileSystemRepresentation);
                        NSLog(@"Renamed key %@ -> %@", oldKeyPath, newKeyPath);
                        NSLog(@"Renamed cert %@ -> %@", oldCertPath, newCertPath);
                    }
                }];
            } else {
                NSSavePanel * saveWindow = NSSavePanel.savePanel;
                saveWindow.nameFieldStringValue = [NSString stringWithFormat:@"%@.p12", self.commonNameInput.stringValue];
                [saveWindow beginSheetModalForWindow:[self.view window] completionHandler:^(NSInteger result) {
                    if (result == NSModalResponseOK) {
                        const char * newPath = [[saveWindow.URL path] UTF8String];
                        rename(savePath.fileSystemRepresentation, newPath);
                        NSLog(@"Renamed p12: %@ -> %s", savePath, newPath);
                    }

                    remove(savePath.fileSystemRepresentation);
                }];
            }
        }
    }];
     
     */
}

@end
