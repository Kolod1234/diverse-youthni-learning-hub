import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, Search, FileText, Brain, Sparkles, 
  Loader2, Trash2, Eye, Download, FolderOpen, Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['knowledge-base'],
    queryFn: () => base44.entities.KnowledgeBaseItem.list('-created_date', 1000),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.KnowledgeBaseItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
      toast.success('Document deleted');
      setSelectedDoc(null);
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      toast.error('Please select a file');
      return;
    }

    setIsProcessing(true);
    try {
      toast.info('Uploading file...');
      
      const uploadResult = await base44.integrations.Core.UploadFile({ file: uploadFile });
      const fileUrl = uploadResult.file_url;

      toast.info('AI is analyzing your document...');
      
      const analysisResult = await base44.functions.invoke('processKnowledgeDocument', {
        file_url: fileUrl,
        title: uploadTitle || uploadFile.name,
        file_type: uploadFile.name.split('.').pop()
      });

      if (analysisResult.data.error) {
        toast.error(analysisResult.data.error);
        return;
      }

      await base44.entities.KnowledgeBaseItem.create(analysisResult.data);
      
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
      toast.success('Document processed and added to knowledge base!');
      
      setUploadFile(null);
      setUploadTitle('');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to process document: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAISearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);
    try {
      const result = await base44.functions.invoke('searchKnowledgeBase', {
        query: searchQuery,
        documents: documents
      });

      if (result.data.results) {
        setSearchResults(result.data.results);
        toast.success(`Found ${result.data.results.length} relevant documents`);
      } else {
        setSearchResults([]);
        toast.info('No results found');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed: ' + error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const categories = [...new Set(documents.map(d => d.category).filter(Boolean))];
  const filteredDocs = selectedCategory === 'all' 
    ? documents 
    : documents.filter(d => d.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Brain className="w-10 h-10 text-purple-600" />
            Knowledge Base
          </h1>
          <p className="text-gray-600">AI-powered document storage, organization, and search</p>
        </div>

        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="search">
              <Search className="w-4 h-4 mr-2" />
              Search
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="browse">
              <FolderOpen className="w-4 h-4 mr-2" />
              Browse
            </TabsTrigger>
          </TabsList>

          {/* AI Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Natural Language Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ask anything... e.g., 'What are the main points about climate change?'"
                    onKeyPress={(e) => e.key === 'Enter' && handleAISearch()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleAISearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-800">
                    💡 <strong>AI-powered search understands:</strong> questions, concepts, summaries, and context - not just keywords
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    Search Results ({searchResults.length})
                  </h3>
                  {searchResults.map((doc) => (
                    <Card key={doc.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6" onClick={() => setSelectedDoc(doc)}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <FileText className="w-5 h-5 text-purple-600 mt-1" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{doc.title}</h4>
                              <p className="text-sm text-gray-600 line-clamp-2">{doc.summary}</p>
                            </div>
                          </div>
                          {doc.relevance_score && (
                            <Badge className="bg-purple-100 text-purple-800">
                              {Math.round(doc.relevance_score * 100)}% match
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {doc.category && (
                            <Badge variant="outline">{doc.category}</Badge>
                          )}
                          {doc.tags?.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-purple-600" />
                  Upload Document
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Title
                  </label>
                  <Input
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Enter document title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt,.md"
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">
                        {uploadFile ? uploadFile.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PDF, DOC, DOCX, TXT, MD (max 10MB)
                      </p>
                    </label>
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    AI Will Automatically:
                  </h4>
                  <ul className="text-sm text-indigo-700 space-y-1">
                    <li>• Extract and analyze all text content</li>
                    <li>• Generate a comprehensive summary</li>
                    <li>• Identify key concepts and topics</li>
                    <li>• Categorize the document</li>
                    <li>• Create searchable tags</li>
                  </ul>
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={!uploadFile || isProcessing}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Upload & Process
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Browse Tab */}
          <TabsContent value="browse" className="space-y-6">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('all')}
                size="sm"
              >
                All Documents ({documents.length})
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat)}
                  size="sm"
                >
                  {cat} ({documents.filter(d => d.category === cat).length})
                </Button>
              ))}
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
              </div>
            ) : filteredDocs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No documents yet. Upload your first document!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocs.map((doc) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow h-full">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <FileText className="w-5 h-5 text-purple-600" />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(doc.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                          {doc.title}
                        </h4>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {doc.summary}
                        </p>

                        {doc.category && (
                          <Badge className="mb-2">{doc.category}</Badge>
                        )}

                        {doc.tags?.length > 0 && (
                          <div className="flex gap-1 flex-wrap mb-3">
                            {doc.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDoc(doc)}
                          className="w-full"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Document Detail Modal */}
        {selectedDoc && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedDoc(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-6 h-6 text-purple-600 mt-1" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {selectedDoc.title}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Added {new Date(selectedDoc.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedDoc(null)}
                  >
                    ×
                  </Button>
                </div>

                <div className="space-y-4">
                  {selectedDoc.category && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Category</h3>
                      <Badge>{selectedDoc.category}</Badge>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Summary</h3>
                    <p className="text-gray-600 bg-gray-50 rounded-lg p-4">
                      {selectedDoc.summary}
                    </p>
                  </div>

                  {selectedDoc.key_concepts?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Key Concepts</h3>
                      <div className="flex gap-2 flex-wrap">
                        {selectedDoc.key_concepts.map((concept) => (
                          <Badge key={concept} variant="outline" className="text-sm">
                            {concept}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDoc.tags?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Tags</h3>
                      <div className="flex gap-2 flex-wrap">
                        {selectedDoc.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Content</h3>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <p className="text-gray-600 whitespace-pre-wrap text-sm">
                        {selectedDoc.content}
                      </p>
                    </div>
                  </div>

                  {selectedDoc.file_url && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(selectedDoc.file_url, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Original File
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}