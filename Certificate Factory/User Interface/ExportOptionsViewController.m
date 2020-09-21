#import "ExportOptionsViewController.h"
#import "CRFRandom.h"

@interface ExportOptionsViewController () <NSTextFieldDelegate> {
    void (^finishedBlock)(CRFExportOptions *);
}

@property (weak) IBOutlet NSSecureTextField *passwordField;
@property (weak) IBOutlet NSSegmentedControl *exportType;
@property (weak) IBOutlet NSButton *encryptPrivateKeys;
@property (weak) IBOutlet NSButton *randomPasswordButton;
@property (weak) IBOutlet NSButton *exportButton;
@property (weak) IBOutlet NSButton *cancelButton;

@end

@implementation ExportOptionsViewController

- (void) getExportOptions:(void (^)(CRFExportOptions * options))finished {
    finishedBlock = finished;
}

- (void) viewDidLoad {
    [super viewDidLoad];
    [self.exportButton setKeyEquivalent:@"\r"];
    self.exportButton.enabled = NO;
    self.passwordField.delegate = self;
}

- (IBAction) generatePassword:(NSButton *)sender {
    NSString * password = [CRFRandom randomStringOfLength:32];
    [self.passwordField setStringValue:password];
}

- (IBAction) changeExportType:(NSSegmentedControl *)sender {
    if (sender.selectedSegment == 0) {
        self.encryptPrivateKeys.enabled = YES;
    } else {
        self.encryptPrivateKeys.enabled = NO;
        self.encryptPrivateKeys.state = NSControlStateValueOn;
        self.passwordField.enabled = YES;
        self.randomPasswordButton.enabled = YES;
    }
}

- (IBAction) changeEncryptPrivateKeys:(NSButton *)sender {
    if (sender.state == NSControlStateValueOff) {
        NSAlert * alert = NSAlert.new;
        [alert addButtonWithTitle:@"Confirm"];
        [alert addButtonWithTitle:@"Cancel"];
        alert.messageText = @"Are you sure?";
        alert.informativeText = @"This will store your private key in plain-text.";
        alert.alertStyle = NSAlertStyleWarning;
        [alert beginSheetModalForWindow:[self.view window] completionHandler:^(NSModalResponse returnCode) {
            if (returnCode == 1001) {
                sender.state = NSControlStateValueOn;
                self.passwordField.enabled = YES;
                self.randomPasswordButton.enabled = YES;
                self.exportButton.enabled = NO;
            } else {
                self.passwordField.enabled = NO;
                self.randomPasswordButton.enabled = NO;
                self.passwordField.stringValue = @"";
                self.exportButton.enabled = YES;
            }
        }];
    } else {
        self.passwordField.enabled = YES;
        self.randomPasswordButton.enabled = YES;
        self.passwordField.stringValue = @"";
        self.exportButton.enabled = NO;
    }
}

- (IBAction) cancelButtonClicked:(NSButton *)sender {
    [self.view.window close];
    finishedBlock(nil);
}

- (IBAction) exportButtonClicked:(NSButton *)sender {
    if (self.passwordField.stringValue.length == 0) {
        if (self.encryptPrivateKeys.state == NSControlStateValueOn) {
            [self.passwordField becomeFirstResponder];
            return;
        }
    }

    CRFExportOptions * options = [CRFExportOptions new];
    options.exportPassword = self.passwordField.stringValue;
    if (self.exportType.selectedSegment == 1) {
        options.exportType = EXPORT_PKCS12;
    } else {
        options.exportType = EXPORT_PEM;
    }
    options.encryptKey = self.encryptPrivateKeys.state == NSControlStateValueOn;
    [self.view.window close];
    finishedBlock(options);
}

- (void) controlTextDidChange:(NSNotification *)obj {
    self.exportButton.enabled = self.passwordField.stringValue.length > 0;
}
@end
