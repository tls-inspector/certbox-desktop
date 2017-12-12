#import "SANObject.h"

@implementation SANObject

- (id) init {
    self = super.init;
    self.value = @"";
    return self;
}

+ (SANObject *) object:(SANObjectType)type value:(NSString *)value {
    SANObject * object = SANObject.new;
    object.type = type;
    object.value = value;
    return object;
}

+ (SANObject *) newDNSObject:(NSString *)value {
    return [SANObject object:SANObjectTypeDNS value:value];
}

- (NSString *) x509Prefix {
    switch (self.type) {
        case SANObjectTypeDNS:
            return @"DNS";
        case SANObjectTypeIP:
            return @"IP";
        case SANObjectTypeEmail:
            return @"email";
        case SANObjectTypeURI:
            return @"URI";
    }
}

@end
