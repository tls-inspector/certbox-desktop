#import "ViewController.h"
#import "CertificateOptionsViewController.h"
#import "CRFFactory.h"
#import "ExportOptionsViewController.h"

@interface ViewController() <NSTableViewDelegate, NSTableViewDataSource>

@property (strong, nonatomic) CRFFactory * factory;

@property (weak) IBOutlet NSButton *generateButton;
@property (weak) IBOutlet NSTextField *validationMessage;
@property (nonatomic) BOOL allowInvalidCertificates;
@property (weak) IBOutlet NSView *containerView;
@property (weak) IBOutlet NSTableView *certTableView;
@property (strong, nonatomic) NSMutableArray<CertificateOptionsViewController *> * certificates;

@end

@implementation ViewController

- (void) viewDidLoad {
    [super viewDidLoad];

    [NSNotificationCenter.defaultCenter addObserver:self selector:@selector(validate) name:NOTIFICATION_VALIDATE object:nil];

    self.certificates = [NSMutableArray new];
    CertificateOptionsViewController * caOptions = [self.storyboard instantiateControllerWithIdentifier:@"Certificate Options"];
    caOptions.root = YES;
    [self.certificates addObject:caOptions];
    [self.certificates addObject:[self.storyboard instantiateControllerWithIdentifier:@"Certificate Options"]];
    [self.certTableView reloadData];
    [self.certTableView selectRowIndexes:[NSIndexSet indexSetWithIndex:0] byExtendingSelection:NO];

    [self validate];
}

- (NSInteger) numberOfRowsInTableView:(NSTableView *)tableView {
    return self.certificates.count;
}

- (NSView *) tableView:(NSTableView *)tableView viewForTableColumn:(NSTableColumn *)tableColumn row:(NSInteger)row {
    NSView * cell;

    if (row == 0) {
        cell = [tableView makeViewWithIdentifier:@"RootCell" owner:self];
    } else {
        cell = [tableView makeViewWithIdentifier:@"CertCell" owner:self];
    }

    CertificateOptionsViewController * options = self.certificates[row];
    NSTextField * cnLabel = [cell viewWithTag:2];
    CRFFactoryCertificateRequest * request = options.getRequest;
    if (request.subject.commonName != nil && request.subject.commonName.length > 0) {
        cnLabel.stringValue = request.subject.commonName;
    } else {
        cnLabel.stringValue = @"Untitled Certificate";
    }
    return cell;
}

- (void) tableViewSelectionDidChange:(NSNotification *)notification {
    CertificateOptionsViewController * options = self.certificates[self.certTableView.selectedRow];
    [self.containerView setSubviews:@[options.view]];
    options.view.frame = self.containerView.bounds;
}

# pragma mark - Table View Delegate

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

    self.generateButton.enabled = YES;
    self.validationMessage.hidden = YES;

    NSInteger selected = self.certTableView.selectedRow;
    [self.certTableView reloadData];
    [self.certTableView selectRowIndexes:[NSIndexSet indexSetWithIndex:selected] byExtendingSelection:NO];
}

- (IBAction) addCertButton:(id)sender {
    NSUInteger selected = self.certTableView.selectedRow;
    [self.certificates addObject:[self.storyboard instantiateControllerWithIdentifier:@"Certificate Options"]];
    [self.certTableView reloadData];
    [self.certTableView selectRowIndexes:[NSIndexSet indexSetWithIndex:selected] byExtendingSelection:NO];
}

- (IBAction) removeCertButton:(id)sender {
    
}

- (IBAction) generateButtonClicked:(NSButton *)sender {
    [self performSegueWithIdentifier:@"ShowExportSegue" sender:nil];
}

- (void) prepareForSegue:(NSStoryboardSegue *)segue sender:(id)sender {
    if ([segue.identifier isEqualToString:@"ShowExportSegue"]) {
        ExportOptionsViewController * exportView = segue.destinationController;
        [exportView getExportOptions:^(CRFExportOptions *options) {
            if (options != nil) {
                [self generateWithExportOptions:options];
            }
        }];
    }
}

- (void) generateWithExportOptions:(CRFExportOptions *)exportOptions {
    CRFFactoryOptions * options = [CRFFactoryOptions new];
    options.exportOptions = exportOptions;
    options.rootRequest = self.certificates[0].getRequest;
    NSMutableArray<CRFFactoryCertificateRequest *> * requests = [NSMutableArray arrayWithCapacity:self.certificates.count - 1];
    for (int i = 1; i < self.certificates.count; i++) {
        [requests addObject:self.certificates[i].getRequest];
    }
    options.serverRequests = requests;

    self.factory = [CRFFactory factoryWithOptions:options];
    [self.factory generateAndSave:^(NSString * _Nullable savePath, NSError * _Nullable error) {
        self.generateButton.enabled = NO;
        if (error) {
            NSAlert * alert = NSAlert.new;
            [alert addButtonWithTitle:@"Dismiss"];
            alert.messageText = @"Error generating certificate and/or key.";
            alert.informativeText = error.localizedDescription;
            alert.alertStyle = NSAlertStyleCritical;
            [alert beginSheetModalForWindow:[self.view window] completionHandler:nil];
        } else {
            NSOpenPanel * panel = NSOpenPanel.openPanel;
            panel.canChooseFiles = NO;
            panel.canChooseDirectories = YES;
            panel.prompt = @"Save";
            [panel beginSheetModalForWindow:[self.view window] completionHandler:^(NSInteger result) {
                if (result == NSModalResponseOK) {
                    NSString * exportPath = [panel.URL path];
                    // Move stuff
                }
            }];
        }
    }];
}

@end
