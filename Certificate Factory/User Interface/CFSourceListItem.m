#import "CFSourceListItem.h"

@implementation CFSourceListItem

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
