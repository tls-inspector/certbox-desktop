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
    caOptions.hideSAN = YES;
    [self.certificates addObject:caOptions];
    [self.certificates addObject:[self.storyboard instantiateControllerWithIdentifier:@"Certificate Options"]];
    [self.certTableView reloadData];
    [self.certTableView selectRowIndexes:[NSIndexSet indexSetWithIndex:0] byExtendingSelection:NO];

    [self validate];
}

- (NSInteger) numberOfRowsInTableView:(NSTableView *)tableView {
    return self.certificates.count;
}

- (NSView *)tableView:(NSTableView *)tableView viewForTableColumn:(NSTableColumn *)tableColumn row:(NSInteger)row {
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

- (IBAction)generateButtonClicked:(NSButton *)sender {
    [self performSegueWithIdentifier:@"ShowExportSegue" sender:nil];
}
@end
