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

- (void) setSan:(SANObject *)san {
    [self.typeSelect selectItemAtIndex:san.type];
    [self.valueInput setStringValue:san.value];
    _san = san;
}

- (IBAction)valueChanged:(NSTextField *)sender {
    [self.san setValue:sender.stringValue];
}

- (IBAction)typeChanged:(NSPopUpButton *)sender {
    [self.san setType:sender.indexOfSelectedItem];
}
@end
