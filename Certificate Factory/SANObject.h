#import <Foundation/Foundation.h>

@interface SANObject : NSObject

typedef NS_ENUM(NSUInteger, SANObjectType) {
    SANObjectTypeFQDN = 0,
    SANObjectTypeIP,
};

@property (nonatomic) SANObjectType type;
@property (strong, nonatomic) NSString * value;

@end
