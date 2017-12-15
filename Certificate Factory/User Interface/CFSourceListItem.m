#import "CFSourceListItem.h"

@interface CFSourceListItem ()

@property (strong, nonatomic, readwrite) CertificateOptionsViewController * optionsViewController;

@end

@implementation CFSourceListItem

- (id) init {
    self = [super init];

    NSStoryboard * main = [NSStoryboard storyboardWithName:@"Main" bundle:[NSBundle mainBundle]];
    self.optionsViewController = [main instantiateControllerWithIdentifier:@"Certificate Options"];

    return self;
}

+ (CFSourceListItem *) itemWithTitle:(NSString *)title identifier:(NSString *)identifier {
    CFSourceListItem * item = [CFSourceListItem new];
    item.title = title;
    item.identifier = identifier;
    return item;
}

+ (CFSourceListItem *) itemWithTitle:(NSString *)title Identifier:(NSString *)identifier Icon:(NSImage *)icon {
    CFSourceListItem * item = [CFSourceListItem new];
    item.title = title;
    item.identifier = identifier;
    item.icon = icon;
    return item;
}

@end
