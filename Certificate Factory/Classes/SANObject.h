#import <Foundation/Foundation.h>

@interface SANObject : NSObject

typedef NS_ENUM(NSUInteger, SANObjectType) {
    SANObjectTypeDNS = 0,
    SANObjectTypeIP = 1,
    SANObjectTypeEmail = 2,
    SANObjectTypeURI = 3,
};

@property (nonatomic) SANObjectType type;
@property (strong, nonatomic) NSString * value;

+ (SANObject *) object:(SANObjectType)type value:(NSString *)value;
+ (SANObject *) newDNSObject:(NSString *)value;
- (NSString *) x509Prefix;

@end
