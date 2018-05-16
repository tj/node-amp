
test:
	@./node_modules/.bin/mocha \
		--require should \
		--bail

bench:
	@./node_modules/.bin/matcha \
		benchmarks/index.js

.PHONY: test bench
