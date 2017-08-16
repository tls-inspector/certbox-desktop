#import "SANCollectionItem.h"

@interface SANCollectionItem () <NSTextFieldDelegate>

@property (weak) IBOutlet NSTextField *valueInput;
@property (weak) IBOutlet NSSegmentedControl *typeSegment;

@end

@implementation SANCollectionItem

- (void)viewDidLoad {
    [super viewDidLoad];
    self.valueInput.delegate = self;
}

- (void) setSan:(SANObject *)san {
    switch (san.type) {
        case SANObjectTypeIP:
            [self.typeSegment setSelectedSegment:1];
            break;
        case SANObjectTypeFQDN:
            [self.typeSegment setSelectedSegment:0];
            break;
    }

    [self.valueInput setStringValue:san.value];
    _san = san;
}

- (void)controlTextDidChange:(NSNotification *)obj {
    [self.san setValue:self.valueInput.stringValue];
}

@end
