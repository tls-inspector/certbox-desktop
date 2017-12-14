#import "ViewController.h"
#import "CertificateOptionsViewController.h"
#import "CRFFactory.h"
#import "CRFRandom.h"
#import "CFSourceListItem.h"

@interface ViewController() <NSOutlineViewDelegate, NSOutlineViewDataSource>

@property (strong, nonatomic) CRFFactory * factory;

@property (weak) IBOutlet NSButton *generateButton;
@property (weak) IBOutlet NSTextField *validationMessage;
@property (nonatomic) BOOL allowInvalidCertificates;
@property (weak) IBOutlet NSOutlineView *outlineView;
@property (strong, nonatomic) NSMutableArray<CFSourceListItem *> * sourceListItems;

@end

@implementation ViewController

- (void) viewDidLoad {

    self.sourceListItems = [NSMutableArray new];
    CFSourceListItem * caItem = [CFSourceListItem itemWithTitle:@"Untitled Root" Identifier:@"root" Icon:[NSImage imageNamed:@"Root Certificate"]];
    caItem.children = @[[CFSourceListItem itemWithTitle:@"Untitled Certificate" Identifier:@"cert" Icon:[NSImage imageNamed:@"Standard Certificate"]]];
    [self.sourceListItems addObject:caItem];
    [self.outlineView reloadData];

    [super viewDidLoad];

    [NSNotificationCenter.defaultCenter addObserver:self selector:@selector(validate) name:NOTIFICATION_VALIDATE object:nil];

    [self validate];
}

#pragma mark - Outline View Methods

- (NSInteger) outlineView:(NSOutlineView *)outlineView numberOfChildrenOfItem:(CFSourceListItem *)item {
    if (item == nil) {
        return self.sourceListItems.count;
    } else {
        return item.children.count;
    }
}

- (id) outlineView:(NSOutlineView *)outlineView child:(NSInteger)index ofItem:(CFSourceListItem *)item {
    if (item == nil) {
        return self.sourceListItems[index];
    } else {
        return item.children[index];
    }
}

- (BOOL) outlineView:(NSOutlineView *)outlineView isItemExpandable:(CFSourceListItem *)item {
    return item.children > 0;
}

- (id) outlineView:(NSOutlineView *)outlineView objectValueForTableColumn:(NSTableColumn *)tableColumn byItem:(CFSourceListItem *)item {
    return item.title;
}

- (NSView *)outlineView:(NSOutlineView *)outlineView viewForTableColumn:(NSTableColumn *)tableColumn item:(CFSourceListItem *)item {
    // Different Source List Items can have completely different UI based on the Item Type. In this sample we have only two types of views (Header and Data Cell). One can have multiple types of data cells.
    // If there is a need to have more than one type of Data Cells. It can be done in this method
    NSTableCellView *view = nil;
    view = [outlineView makeViewWithIdentifier:@"DataCell" owner:self];
    view.imageView.image = item.icon;
    view.textField.stringValue = item.title;
    return view;
}

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
}

@end
