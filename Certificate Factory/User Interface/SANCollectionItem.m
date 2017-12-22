#import "SANCollectionItem.h"

@interface SANCollectionItem () <NSTextFieldDelegate>

@property (weak) IBOutlet NSTextField *valueInput;
@property (weak) IBOutlet NSPopUpButton *typeSelect;

@end

@implementation SANCollectionItem

- (void)viewDidLoad {
    [super viewDidLoad];
    self.valueInput.delegate = self;
}

- (void) setSan:(CRFSANObject *)san {
    [self.typeSelect selectItemAtIndex:san.type];
    [self.valueInput setStringValue:san.value];
    _san = san;
}

- (void)controlTextDidChange:(NSNotification *)obj {
    [self.san setValue:self.valueInput.stringValue];
    [NSNotificationCenter.defaultCenter postNotificationName:NOTIFICATION_SAN_UPDATED object:nil];
}

- (IBAction)typeChanged:(NSPopUpButton *)sender {
    [self.san setType:sender.indexOfSelectedItem];
}
@end
