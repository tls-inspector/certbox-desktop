#import "ViewController.h"
#import "SANCollectionItem.h"
#import "SANObject.h"
#import "CRFFactory.h"
#import "CRFRandom.h"

@interface ViewController() <NSCollectionViewDelegate, NSCollectionViewDataSource, NSTextFieldDelegate, NSDatePickerCellDelegate>

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

    self.serialInput.delegate = self;
    self.dateToInput.delegate = self;
    self.dateFromInput.delegate = self;
    self.countryInput.delegate = self;
    self.stateInput.delegate = self;
    self.cityInput.delegate = self;
    self.orgInput.delegate = self;
    self.departmentInput.delegate = self;
    self.commonNameInput.delegate = self;
    self.passwordInput.delegate = self;

    self.SANs = [NSMutableArray new];
    [self.SANs addObject:[SANObject new]];
    self.sanCollectionView.backgroundView.layer.backgroundColor = [NSColor clearColor].CGColor;

    [self.dateFromInput setDateValue:[NSDate date]];
    [self.dateToInput setDateValue:[NSDate dateWithTimeIntervalSinceNow:31557600]]; // 1 year.

    [NSNotificationCenter.defaultCenter addObserver:self selector:@selector(validate) name:NOTIFICATION_SAN_UPDATED object:nil];

    [self validate];
}

- (void)setRepresentedObject:(id)representedObject {
    [super setRepresentedObject:representedObject];
}

- (void)controlTextDidChange:(NSNotification *)obj {
    [self validate];
}

- (void)datePickerCell:(NSDatePickerCell *)datePickerCell validateProposedDateValue:(NSDate *__autoreleasing  _Nonnull *)proposedDateValue timeInterval:(NSTimeInterval *)proposedTimeInterval {
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

    // Start date can't be after end date
    if ([self.dateToInput.dateValue timeIntervalSinceDate:self.dateFromInput.dateValue] < 0) {
        isValid = NO;
        self.validationMessage.stringValue = @"Start date cannot be after end date.";
        goto finished;
    }

    isValid =
        [self requiredInput:self.serialInput friendlyName:@"Serial"] &&
        [self requiredInput:self.serialInput friendlyName:@"Serial"] &&
        [self requiredInput:self.stateInput friendlyName:@"State/Province"] &&
        [self requiredInput:self.cityInput friendlyName:@"City"] &&
        [self requiredInput:self.orgInput friendlyName:@"Organization"] &&
        [self requiredInput:self.departmentInput friendlyName:@"Department/OU"] &&
        [self requiredInput:self.commonNameInput friendlyName:@"Common Name"] &&
        [self requiredInput:self.passwordInput friendlyName:@"Export Password"];

    if (!isValid) {
        goto finished;
    }

    BOOL validSANs = NO;
    for (SANObject * san in self.SANs) {
        if (san.value.length > 0) {
            validSANs = YES;
            break;
        }
    }
    if (!validSANs) {
        isValid = NO;
        self.validationMessage.stringValue = @"At least one SAN must be provided.";
        goto finished;
    }

finished:
    self.generateButton.enabled = isValid;
    self.validationMessage.hidden = isValid;
}

- (BOOL) requiredInput:(NSTextField *)input friendlyName:(NSString *)friendlyName {
    if (input.stringValue.length <= 0) {
        self.validationMessage.stringValue = [NSString stringWithFormat:@"%@ is required", friendlyName];
        return NO;
    }
    return YES;
}

- (IBAction)addSAN:(NSButton *)sender {
    [self.SANs addObject:[SANObject new]];
    [self.sanCollectionView reloadData];
}

- (IBAction)removeSAN:(NSButton *)sender {
    if (self.SANs.count > 1) {
        [self.SANs removeLastObject];
        [self.sanCollectionView reloadData];
    }
}

- (IBAction)randomSerialButton:(id)sender {
    NSUInteger randomNumber = [CRFRandom randomNumberBetween:1000000000 To:9999999999];
    [self.serialInput setStringValue:[NSString stringWithFormat:@"%lu", (unsigned long)randomNumber]];
    [self validate];
}

- (IBAction)randomPasswordButton:(id)sender {
    NSString * password = [CRFRandom randomStringOfLength:16];
    [self.passwordInput setStringValue:password];
    [self validate];

    NSAlert * alert = [NSAlert new];
    [alert setMessageText:@"Export Password"];
    [alert setInformativeText:password];
    [alert addButtonWithTitle:@"OK"];
    [alert addButtonWithTitle:@"Cancel"];
    [alert setAlertStyle:NSAlertStyleInformational];
    [alert beginSheetModalForWindow:self.view.window completionHandler:nil];
}

- (IBAction)generateButton:(NSButton *)sender {
    sender.enabled = NO;

    CRFFactoryOptions * options = [CRFFactoryOptions new];
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
                    if (result == NSModalResponseOK) {
                        NSString * exportPath = [[panel URL] path];

                        NSString * oldKeyPath = [NSString stringWithFormat:@"%@/server.key", savePath];
                        NSString * oldCertPath = [NSString stringWithFormat:@"%@/server.crt", savePath];

                        NSString * newKeyPath = [NSString stringWithFormat:@"%@/%@.key", exportPath, self.commonNameInput.stringValue];
                        NSString * newCertPath = [NSString stringWithFormat:@"%@/%@.crt", exportPath, self.commonNameInput.stringValue];

                        rename([oldKeyPath fileSystemRepresentation], [newKeyPath fileSystemRepresentation]);
                        rename([oldCertPath fileSystemRepresentation], [newCertPath fileSystemRepresentation]);
                        NSLog(@"Renamed key %@ -> %@", oldKeyPath, newKeyPath);
                        NSLog(@"Renamed cert %@ -> %@", oldCertPath, newCertPath);
                    }
                }];
            } else {
                NSSavePanel * saveWindow = [NSSavePanel savePanel];
                saveWindow.nameFieldStringValue = [NSString stringWithFormat:@"%@.p12", self.commonNameInput.stringValue];
                [saveWindow beginSheetModalForWindow:[self.view window] completionHandler:^(NSInteger result) {
                    if (result == NSModalResponseOK) {
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
