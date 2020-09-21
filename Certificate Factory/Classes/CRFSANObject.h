#import <Foundation/Foundation.h>

@interface CRFSANObject : NSObject

typedef NS_ENUM(NSUInteger, SANObjectType) {
    SANObjectTypeDNS = 0,
    SANObjectTypeIP = 1,
    SANObjectTypeEmail = 2,
    SANObjectTypeURI = 3,
};

@property (nonatomic) SANObjectType type;
@property (strong, nonatomic) NSString * value;

+ (CRFSANObject *) object:(SANObjectType)type value:(NSString *)value;
+ (CRFSANObject *) newDNSObject:(NSString *)value;
- (NSString *) x509Prefix;

@end
