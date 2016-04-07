//Copyright {2016} {NIIT Limited, Wipro Limited}
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
//

var mongoose = require('mongoose'),
    qsetPatternSchema = mongoose.Schema({
      patternName: {type: String, required: true, unique: true},
      whitelist: Array,
      blacklist: Array,
      regexPatterns: Array,
      wikiRange: { min: Number, max: Number, options: { floor: Number, ceil: Number, step: Number } },
      gTrendsRange: { min: Number, max: Number, options: { floor: Number, ceil: Number, step: Number } },
      usageRange: { min: Number, max: Number, options: { floor: Number, ceil: Number, step: Number } },
      correctRange: { min: Number, max: Number, options: { floor: Number, ceil: Number, step: Number } }
    }),
    QsetPattern = mongoose.model('QsetPattern', qsetPatternSchema, "qset_pattern_collection");

module.exports = QsetPattern;
