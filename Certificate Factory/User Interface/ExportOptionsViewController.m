#import "ExportOptionsViewController.h"
#import "CRFRandom.h"

@interface ExportOptionsViewController () <NSTextFieldDelegate>

@property (weak) IBOutlet NSTextField *passwordField;
@property (weak) IBOutlet NSSegmentedControl *exportType;
@property (weak) IBOutlet NSButton *encryptPrivateKeys;
@property (weak) IBOutlet NSButton *randomPasswordButton;
@property (weak) IBOutlet NSButton *exportButton;
@property (weak) IBOutlet NSButton *cancelButton;

@end

@implementation ExportOptionsViewController

- (void) viewDidLoad {
    [super viewDidLoad];
    [self.exportButton setKeyEquivalent:@"\r"];
    self.exportButton.enabled = NO;
    self.passwordField.delegate = self;
}

- (IBAction) generatePassword:(NSButton *)sender {
    // TODO
}

- (IBAction) changeExportType:(NSSegmentedControl *)sender {
    if (sender.selectedSegment == 0) {
        self.encryptPrivateKeys.enabled = YES;
    } else {
        self.encryptPrivateKeys.enabled = NO;
        self.encryptPrivateKeys.state = NSControlStateValueOn;
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
            }
        }];
    }
}

- (IBAction) cancelButtonClicked:(NSButton *)sender {
    [self.view.window close];
}

- (IBAction) exportButtonClicked:(NSButton *)sender {
    // TODO
}

- (void) controlTextDidChange:(NSNotification *)obj {
    self.exportButton.enabled = self.passwordField.stringValue.length > 0;
}
@end
