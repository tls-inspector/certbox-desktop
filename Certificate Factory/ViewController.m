#import "ViewController.h"
#import "SANCollectionItem.h"
#import "SANObject.h"
#import "CRFFactory.h"

@interface ViewController() <NSCollectionViewDelegate, NSCollectionViewDataSource>

@property (weak) IBOutlet NSTextField *serialInput;
@property (weak) IBOutlet NSSegmentedControl *keyAlgToggle;
@property (weak) IBOutlet NSDatePicker *dateFromInput;
@property (weak) IBOutlet NSDatePicker *dateToInput;
@property (weak) IBOutlet NSTextField *countryInput;
@property (weak) IBOutlet NSTextField *stateInput;
@property (weak) IBOutlet NSTextField *cityInput;
@property (weak) IBOutlet NSTextField *orgInput;
@property (weak) IBOutlet NSTextField *departmentInput;
@property (weak) IBOutlet NSTextField *commonNameInput;
@property (weak) IBOutlet NSCollectionView *sanCollectionView;
@property (weak) IBOutlet NSButton *generateButton;
@property (weak) IBOutlet NSTextField *validationMessage;
@property (weak) IBOutlet NSTextField *keyLengthLabel;
@property (weak) IBOutlet NSSecureTextField *passwordInput;
@property (weak) IBOutlet NSSegmentedControl *exportTypeToggle;

@property (strong, nonatomic) NSMutableArray<SANObject *> * SANs;
@property (strong, nonatomic) CRFFactory * factory;

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    self.SANs = [NSMutableArray new];
    [self.SANs addObject:[SANObject new]];
    self.sanCollectionView.backgroundView.layer.backgroundColor = [NSColor clearColor].CGColor;

    [self.dateFromInput setDateValue:[NSDate date]];
    [self.dateToInput setDateValue:[NSDate dateWithTimeIntervalSinceNow:31557600]]; // 1 year.
    [self validate];
}

- (void)setRepresentedObject:(id)representedObject {
    [super setRepresentedObject:representedObject];
}

- (IBAction)fieldEdit:(id)sender {
    [self validate];
}

- (IBAction)changeKeyAlg:(NSSegmentedControl *)sender {
    if (sender.selectedSegment == 0) {
        self.keyLengthLabel.stringValue = @"2048-bit Key";
    } else if (sender.selectedSegment == 1) {
        self.keyLengthLabel.stringValue = @"256-bit Key";
    }
}

- (void) validate {
    BOOL isValid = YES;

#define REQUIRED_INPUT(input, friendlyName) if (input.stringValue.length <= 0) { isValid = NO; self.validationMessage.stringValue = friendlyName @" is required."; goto finished; }

    // Start date can't be after end date
    if ([self.dateToInput.dateValue timeIntervalSinceDate:self.dateFromInput.dateValue] < 0) {
        isValid = NO;
        self.validationMessage.stringValue = @"Start date cannot be after end date.";
        goto finished;
    }

    REQUIRED_INPUT(self.serialInput, @"Serial");
    REQUIRED_INPUT(self.stateInput, @"State/Province");
    REQUIRED_INPUT(self.cityInput, @"City");
    REQUIRED_INPUT(self.orgInput, @"Organization");
    REQUIRED_INPUT(self.departmentInput, @"Department/OU");
    REQUIRED_INPUT(self.commonNameInput, @"Common Name");
    REQUIRED_INPUT(self.passwordInput, @"Export Password");

finished:
    self.generateButton.enabled = isValid;
    self.validationMessage.hidden = isValid;
}

- (IBAction)addSAN:(NSButton *)sender {
    [self.SANs addObject:[SANObject new]];
    [self.sanCollectionView reloadData];
}

- (IBAction)removeSAN:(NSButton *)sender {
    if (self.SANs.count > 0) {
        [self.SANs removeLastObject];
        [self.sanCollectionView reloadData];
    }
}

- (IBAction)generateButton:(NSButton *)sender {
    sender.enabled = NO;

    CRFFactoryOptions * options = [CRFFactoryOptions new];
    options.serial = self.serialInput.stringValue;
    options.keyType = self.keyAlgToggle.selectedSegment == 0 ? KEY_ALG_RSA : KEY_ALG_ECDSA;
    options.dateStart = self.dateFromInput.dateValue;
    options.dateEnd = self.dateToInput.dateValue;
    options.country = self.countryInput.stringValue;
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
            NSAlert * alert = [NSAlert new];
            [alert addButtonWithTitle:@"Dismiss"];
            alert.messageText = @"Error generating certificate and/or key.";
            alert.informativeText = error.localizedDescription;
            alert.alertStyle = NSAlertStyleCritical;
            [alert beginSheetModalForWindow:[self.view window] completionHandler:nil];
        } else {
            if (self.exportTypeToggle.selectedSegment == 0) {
                NSOpenPanel * panel = [NSOpenPanel openPanel];
                panel.canChooseFiles = NO;
                panel.canChooseDirectories = YES;
                panel.prompt = @"Save";
                [panel beginSheetModalForWindow:[self.view window] completionHandler:^(NSInteger result) {
                    if (result == NSFileHandlingPanelOKButton) {
                        NSString * exportPath = [[panel URL] path];

                        NSString * oldKeyPath = [NSString stringWithFormat:@"%@/server.key", savePath];
                        NSString * newKeyPath = [NSString stringWithFormat:@"%@/server.key", exportPath];
                        NSString * oldCertPath = [NSString stringWithFormat:@"%@/server.crt", savePath];
                        NSString * newCertPath = [NSString stringWithFormat:@"%@/server.crt", exportPath];

                        rename([oldKeyPath fileSystemRepresentation], [newKeyPath fileSystemRepresentation]);
                        rename([oldCertPath fileSystemRepresentation], [newCertPath fileSystemRepresentation]);
                        NSLog(@"Renamed key %@ -> %@", oldKeyPath, newKeyPath);
                        NSLog(@"Renamed cert %@ -> %@", oldCertPath, newCertPath);
                    }
                }];
            } else {
                NSSavePanel * saveWindow = [NSSavePanel savePanel];
                saveWindow.nameFieldStringValue = @"server.p12";
                [saveWindow beginSheetModalForWindow:[self.view window] completionHandler:^(NSInteger result) {
                    if (result == NSFileHandlingPanelOKButton) {
                        const char * newPath = [[[saveWindow URL] path] UTF8String];
                        rename([savePath fileSystemRepresentation], newPath);
                        NSLog(@"Renamed p12: %@ -> %s", savePath, newPath);
                    }

                    remove([savePath fileSystemRepresentation]);
                }];
            }
        }
    }];
}

# pragma mark - Collection View Data Source

- (NSInteger) numberOfSectionsInCollectionView:(NSCollectionView *)collectionView {
    return 1;
}

- (NSInteger) collectionView:(NSCollectionView *)collectionView numberOfItemsInSection:(NSInteger)section {
    return self.SANs.count;
}

- (NSCollectionViewItem *) collectionView:(NSCollectionView *)collectionView itemForRepresentedObjectAtIndexPath:(NSIndexPath *)indexPath {
    SANCollectionItem * item = [self.storyboard instantiateControllerWithIdentifier:@"SAN Collection"];
    item.san = [self.SANs objectAtIndex:indexPath.item];
    return item;
}

@end
