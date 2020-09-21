#import "CRFSANObject.h"

@implementation CRFSANObject

- (id) init {
    self = super.init;
    self.value = @"";
    return self;
}

+ (CRFSANObject *) object:(SANObjectType)type value:(NSString *)value {
    CRFSANObject * object = CRFSANObject.new;
    object.type = type;
    object.value = value;
    return object;
}

+ (CRFSANObject *) newDNSObject:(NSString *)value {
    return [CRFSANObject object:SANObjectTypeDNS value:value];
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
