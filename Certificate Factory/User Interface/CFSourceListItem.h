#import <Foundation/Foundation.h>
#import "CertificateOptionsViewController.h"

@interface CFSourceListItem : NSObject

@property (nonatomic, retain) NSString * title;
@property (nonatomic, retain) NSString * identifier;
@property (nonatomic, retain) NSImage  * icon;
@property (nonatomic, retain) NSArray<CFSourceListItem *> * children;
@property (strong, nonatomic, readonly) CertificateOptionsViewController * optionsViewController;

+ (CFSourceListItem *) itemWithTitle:(NSString *)title identifier:(NSString *)identifier;
+ (CFSourceListItem *) itemWithTitle:(NSString *)title Identifier:(NSString *)identifier Icon:(NSImage *)icon;


@end
