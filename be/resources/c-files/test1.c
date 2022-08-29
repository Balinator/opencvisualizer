//#include <stdio.h>

int main() {
    int a = 2;
    a = 15;
    int b = 35 - a;
    int asd = 12;
    if (b < 10) {
        int k = 1;
        a = 12 + k;
    } else if(b < 0) {
        a = 12;
    } else {
        a = 5;
    }
    for(int i = 0; i < 10; ++i) {
        a = a + b;
    }
    int k = 0;
    while(k < 3) {
        k++;
    }
}