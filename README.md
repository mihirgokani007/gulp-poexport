# [gulp](http://gulpjs.com)-poexport

> Export translations to a spreadsheet


## Install

Install with [npm][1]

```sh
npm install --save-dev gulp-poexport
```


## API

```js
var gulp = require('gulp');
var poexport = require('gulp-poexport');

gulp.task('translations', function () {
    return gulp.src('po/**/*.po')
        .pipe(poexport('exported.xlsx', {filter: 'empty'}));
});
```

# End Matter

## Author

[Mihir Gokani][0]

## License

Licensed under MIT.


[0]: https://github.com/mihirgokani007
[1]: https://npmjs.org/package/gulp-poexport
[2]: https://github.com/rubenv/pofile#the-poitem-class


