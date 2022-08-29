#include <stdio.h>

int list[10] = {0, 5, 13, 9, 2, 6, 7, 15, 20, 1};
int n = 10;

void swap(int index, int nextIndex) {
	int temp = list[index];
	list[index] = list[nextIndex];
	list[nextIndex] = temp;
}

int main() {
	for (int round = 0; round < n - 1; round++) {
		for (int index = 0; index < n - round - 1; index++) {
			int nextIndex = index + 1;
			if (list[index] > list[nextIndex]) {
				swap(index, nextIndex);
			}
		}
	}
}