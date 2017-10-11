#import "CRFRandom.h"

@implementation CRFRandom

const NSUInteger NUMBER_OF_CHARS = 16;
+ (NSString *)randomString {
    static char const possibleChars[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=;:/?.>,<";
    unichar characters[NUMBER_OF_CHARS];
    for (int index=0; index < NUMBER_OF_CHARS; ++index) {
        characters[index] = possibleChars[arc4random_uniform(sizeof(possibleChars)-1)];
    }

    return [NSString stringWithCharacters:characters length:NUMBER_OF_CHARS];
}

+ (NSUInteger)randomNumberBetween:(int)from To:(int)to {
    return (int)from + arc4random() % (to-from+1);
}

@end
