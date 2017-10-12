#import "CRFRandom.h"

@implementation CRFRandom

+ (NSString *)randomStringOfLength:(NSUInteger)length {
    static char const possibleChars[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=;:/?.>,<";
    unichar characters[length];
    for (int index=0; index < length; ++index) {
        characters[index] = possibleChars[arc4random_uniform(sizeof(possibleChars)-1)];
    }

    return [NSString stringWithCharacters:characters length:length];
}

+ (NSUInteger)randomNumberBetween:(NSUInteger)from To:(NSUInteger)to {
    return (NSUInteger)from + arc4random() % (to-from+1);
}

@end
