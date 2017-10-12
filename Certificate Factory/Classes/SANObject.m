#import "SANObject.h"

@implementation SANObject

- (id) init {
    self = [super init];
    self.value = @"";
    return self;
}

+ (SANObject *) newDNSObject:(NSString *)value {
    SANObject * object = [SANObject new];
    object.type = SANObjectTypeDNS;
    object.value = value;
    return object;
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
