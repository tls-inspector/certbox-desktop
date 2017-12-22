#import "CertificateOptionsViewController.h"
#import "SANCollectionItem.h"
#import "CRFFactoryCertificateSubject.h"
#import "CRFRandom.h"
#import "CFKeyUsageViewController.h"

@interface CertificateOptionsViewController () <NSCollectionViewDelegate, NSCollectionViewDataSource, NSTextFieldDelegate, NSDatePickerCellDelegate>

@property (weak) IBOutlet NSTextField *serialNumberInput;
@property (weak) IBOutlet NSSegmentedControl *keyAlgSegment;
@property (weak) IBOutlet NSTextField *keyLengthLabel;
@property (weak) IBOutlet NSDatePicker *startDateInput;
@property (weak) IBOutlet NSDatePicker *endDateInput;
@property (weak) IBOutlet NSTextField *subjectCInput;
@property (weak) IBOutlet NSTextField *subjectSInput;
@property (weak) IBOutlet NSTextField *subjectLInput;
@property (weak) IBOutlet NSTextField *subjectOInput;
@property (weak) IBOutlet NSTextField *subjectOUInput;
@property (weak) IBOutlet NSTextField *subjectCNInput;
@property (weak) IBOutlet NSBox *basicInfoBox;
@property (weak) IBOutlet NSBox *subjectBox;
@property (weak) IBOutlet NSBox *keyUsageBox;
@property (weak) IBOutlet NSBox *sanBox;
@property (weak) IBOutlet NSCollectionView *sanCollectionView;
@property (weak) IBOutlet NSButton *sanAddButton;
@property (weak) IBOutlet NSButton *sanRemoveButton;
@property (weak) IBOutlet NSView *keyUsageView;
@property (weak) IBOutlet NSView *importedNotice;

@property (strong, nonatomic) NSMutableArray<SANObject *> * SANs;
@property (strong, nonatomic) NSError * validationError;
@property (strong, nonatomic) CFKeyUsageViewController * keyUsageViewController;

@end

@implementation CertificateOptionsViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    self.serialNumberInput.delegate = self;
    self.startDateInput.delegate = self;
    self.endDateInput.delegate = self;
    self.subjectCInput.delegate = self;
    self.subjectLInput.delegate = self;
    self.subjectOInput.delegate = self;
    self.subjectSInput.delegate = self;
    self.subjectCNInput.delegate = self;
    self.subjectOUInput.delegate = self;
    self.sanCollectionView.delegate = self;
    self.sanCollectionView.dataSource = self;
    
    self.SANs = NSMutableArray.new;
    [self.SANs addObject:SANObject.new];
    self.sanCollectionView.backgroundView.layer.backgroundColor = NSColor.clearColor.CGColor;
    
    [self.startDateInput setDateValue:NSDate.date];
    [self.endDateInput setDateValue:[NSDate dateWithTimeIntervalSinceNow:31557600]]; // 1 year.

    self.keyUsageViewController = [self.storyboard instantiateControllerWithIdentifier:@"Key Usage"];
    [self.keyUsageView addSubview:self.keyUsageViewController.view];

    if (self.root) {
        self.sanBox.hidden = YES;
        [self.keyUsageViewController defaultRoot];
    } else {
        self.sanBox.hidden = NO;
        [self.keyUsageViewController defaultCert];
    }

    [self toggleImportNotice];
}

- (void) toggleImportNotice {
    if (self.importedRequest != nil) {
        self.basicInfoBox.hidden = YES;
        self.subjectBox.hidden = YES;
        self.keyUsageBox.hidden = YES;
        self.sanBox.hidden = YES;
        self.importedNotice.hidden = NO;
    } else {
        self.basicInfoBox.hidden = NO;
        self.subjectBox.hidden = NO;
        self.keyUsageBox.hidden = NO;
        self.sanBox.hidden = NO;
        self.importedNotice.hidden = YES;
    }
}

- (void) controlTextDidChange:(NSNotification *)obj {
    [self validate];
    [NSNotificationCenter.defaultCenter postNotificationName:NOTIFICATION_VALIDATE object:nil];
}

- (void) datePickerCell:(NSDatePickerCell *)datePickerCell validateProposedDateValue:(NSDate *__autoreleasing  _Nonnull *)proposedDateValue timeInterval:(NSTimeInterval *)proposedTimeInterval {
    [self validate];
    [NSNotificationCenter.defaultCenter postNotificationName:NOTIFICATION_VALIDATE object:nil];
}

- (void) validate {
    if (self.importedRequest != nil) {
        self.validationError = nil;
        return;
    }

    BOOL isValid = YES;
    
    // Start date can't be after end date
    if ([self.startDateInput.dateValue timeIntervalSinceDate:self.endDateInput.dateValue] > 0) {
        self.validationError = [NSError errorWithDomain:@"validation" code:1 userInfo:@{NSLocalizedDescriptionKey: @"Start date cannot be after end date."}];
        return;
    }
    
    isValid =
        [self requiredInput:self.subjectSInput friendlyName:@"State/Province"] &&
        [self requiredInput:self.subjectLInput friendlyName:@"City"] &&
        [self requiredInput:self.subjectOInput friendlyName:@"Organization"] &&
        [self requiredInput:self.subjectOUInput friendlyName:@"Department/OU"] &&
        [self requiredInput:self.subjectCNInput friendlyName:@"Common Name"] &&
        [self requiredInput:self.subjectCInput friendlyName:@"Country"];
    
    if (!isValid) {
        return;
    } else {
        self.validationError = nil;
    }

    if (!self.root && self.keyUsageViewController.serverAuth.state == NSControlStateValueOn) {
        BOOL validSANs = NO;
        for (SANObject * san in self.SANs) {
            if (san.value.length > 0) {
                validSANs = YES;
                break;
            }
        }
        if (!validSANs) {
            isValid = NO;
            self.validationError = [NSError errorWithDomain:@"validation" code:1 userInfo:@{NSLocalizedDescriptionKey: @"At least one SAN must be provided."}];
            return;
        }
    }
}

- (IBAction) cancelImport:(NSButton *)sender {
    self.importedRequest = nil;
    [self toggleImportNotice];
    [self validate];
}

- (BOOL) requiredInput:(NSTextField *)input friendlyName:(NSString *)friendlyName {
    if (input.stringValue.length <= 0) {
        self.validationError = [NSError errorWithDomain:@"validation" code:1 userInfo:@{NSLocalizedDescriptionKey:[NSString stringWithFormat:@"%@ is required", friendlyName]}];
        return NO;
    }
    return YES;
}

- (void) enableAllControls {
    [self setControlEnabled:YES];
}

- (void) disableAllControls {
    [self setControlEnabled:NO];
}

- (void) setControlEnabled:(BOOL)enabled {
    self.serialNumberInput.enabled = enabled;
    self.keyAlgSegment.enabled = enabled;
    self.keyLengthLabel.enabled = enabled;
    self.startDateInput.enabled = enabled;
    self.endDateInput.enabled = enabled;
    self.subjectCInput.enabled = enabled;
    self.subjectSInput.enabled = enabled;
    self.subjectLInput.enabled = enabled;
    self.subjectOInput.enabled = enabled;
    self.subjectOUInput.enabled = enabled;
    self.subjectCNInput.enabled = enabled;
    self.sanAddButton.enabled = enabled;
    self.sanRemoveButton.enabled = enabled;
}

- (CRFFactoryCertificateRequest *) getRequest {
    if (self.importedRequest != nil) {
        return self.importedRequest;
    }

    CRFFactoryCertificateRequest * request = [CRFFactoryCertificateRequest new];

    request.serial = [self.serialNumberInput stringValue];
    request.keyType = self.keyAlgSegment.selectedSegment == 0 ? KEY_ALG_RSA : KEY_ALG_ECDSA;
    request.dateStart = [self.startDateInput dateValue];
    request.dateEnd = [self.endDateInput dateValue];
    request.subject = [CRFFactoryCertificateSubject new];
    request.subject.country = [self.subjectCInput stringValue];
    request.subject.state = [self.subjectSInput stringValue];
    request.subject.city = [self.subjectLInput stringValue];
    request.subject.organization = [self.subjectOInput stringValue];
    request.subject.department = [self.subjectOUInput stringValue];
    request.subject.commonName = [self.subjectCNInput stringValue];

    if (self.SANs.count > 0) {
        request.sans = self.SANs;
    }

    request.usage = self.keyUsageViewController.getUsage;
    request.isCA = self.root;

    return request;
}

- (IBAction) changeKeyType:(NSSegmentedCell *)sender {
    if (sender.selectedSegment == 0) {
        self.keyLengthLabel.stringValue = @"2048-bit Key";
    } else if (sender.selectedSegment == 1) {
        self.keyLengthLabel.stringValue = @"256-bit Key";
    }
}

- (IBAction) generateSerialButton:(NSButton *)sender {
    NSUInteger randomNumber = [CRFRandom randomNumberBetween:1000000000 To:9999999999];
    [self.serialNumberInput setStringValue:[NSString stringWithFormat:@"%lu", (unsigned long)randomNumber]];
}

- (IBAction) addSAN:(NSButton *)sender {
    [self.SANs addObject:SANObject.new];
    [self.sanCollectionView reloadData];
}

- (IBAction) removeSAN:(NSButton *)sender {
    if (self.SANs.count > 1) {
        [self.SANs removeLastObject];
        [self.sanCollectionView reloadData];
    }
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
