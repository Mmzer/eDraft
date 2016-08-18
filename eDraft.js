/**
 * 输入框和文本域保存草稿
 * @author chw
 * @updatetime 2016/8/18
 */
define([],function(){
	(function($){

		$.fn.edraft = function(opt){
			var edraft = eDraft.getInstance();
			edraft.protect( this, opt );
			return edraft;
		};

		var Storage = {};

		/**
		 * 检查是否支持localStorage
		 * @return Boolean
		 */
		Storage.isAvailable = function(){
			if(typeof localStorage === 'object'){
				return true;
			}else{
				return false;
			}
		};
		Storage.set = function(key,value){
			localStorage.setItem( key, value + "" );
		};
		Storage.get = function(key){
			return localStorage.getItem( key );
		}
		Storage.remove = function(key){
			localStorage.removeItem( key );
		};
		Storage.clear = function(){
			localStorage.clear();
		}


		eDraft = (function(){

			function init(){
				return {
					initOption:function(opt){
						var defaults = {
							timeout: 3000,
							autoRelease: true
						};

						this.opt = $.extend(defaults,opt);
						this.store = Storage;
						this.timers = {};
					},
					setOption:function(opt){
					    this.initOption(opt);
						this.opt = $.extend(this.opt,opt);
					},
					protect:function(targets,opt){
						this.setOption(opt);
						targets = targets || {};
						this.targets = targets;

						var self = this;
						targets.forEach(function(target){
							self.getStoreValue(target);
							$(target).focus(function(){ //输入框在聚焦时候开始周期性的存储输入数据
								self.saveInterval(target);
							}).blur(function(){ //输入框在失去焦点的时候停止存储输入数据
								self.clearSaveInterval(target);
								if(self.opt.autoRelease){
									self.autoRelease(target);
								}
							});

						});	
					},

					/**
					 * 存储数据
					 */
					saveData:function(target){
						var saveObj = {},
							saveStr = '';

						saveObj.value = target.value;
						saveObj.name = target.name;
						saveObj.updateTime = new Date().getTime();

						saveStr = JSON.stringify(saveObj);
						this.store.remove(target.name);
						this.store.set(target.name, saveStr);
					},

					/**
					 * 周期性循环保存
					 */
					saveInterval:function(target){
						var self = this;
						var tagName = target.tagName;
						if(tagName === 'TEXTAREA' || tagName === 'INPUT'){
							self.timers[target.name] = setInterval(function(){
								self.saveData(target);
							},self.opt.timeout);
						}
					},

					/**
					 * 输入完毕时候停止保存计时器
					 */
					clearSaveInterval:function(target){
						this.saveData(target);
						clearInterval(this.timers[target.name]);
					},

					/**
					 * 取出缓存数据
					 */
					getStoreValue:function(target){
						var key = target.name;
						var itemValue = this.store.get(key);
						if(!itemValue){
							var itemObj = JSON.parse(itemValue);
							target.value = itemObj.value;
							return itemObj;
						}
						return null;
					},

					/**
					 * 30min后自动释放
					 */
					autoRelease:function(target){
						var self = this;
						setTimeout(function(){
							self.store.remove(target.name);
						},30 * 60 * 1000);
					},

					/**
					 * 释放缓存数据
					 */
					releaseData:function(targets){
						var targets = this.targets || targets;
						var self = this;
						targets.forEach(function(target){
							var name = target.name;
							self.store.remove(target.name);
						});
					},

					/**
					 * 释放页面的所有数据
					 */
					releaseAll:function(){
						var textareas = $('textarea'),
							inputs = $('input');

						this.releaseData(textareas);
						this.releaseData(inputs);
					}
				};
			}

			return {
				getInstance:function(){
					return init();
				},
				version:'0.0.1'
			}
		})();


	})(Zepto || jQuery);
});